const DAL = require('../DAL');
const reportsBL = require('./reportsBL');
const config = require('../../config');
const http = require('http');
const https = require('https');
const events = require('../events');
const generator = require('../generator');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    projectsRequests: {},

    getReplaceObject: (index) => {
        return {
            "{number}": index,
            "{text}": index.toString(),
            "{date}": new Date(),
            "{iso}": new Date().toISOString(),
            "{random}": generator.generateId // Callback to generate different guid for each occurrence. 
        }
    },

    async testRequest(request, requestTimeout, env) {
        setEnvironmentOnRequest(env.values, request);
        let sendObject = buildSendObject(request, requestTimeout);
        const reqData = sendObject.data;

        if (reqData && (jsonData = jsonTryParse(reqData))) {
            replaceJsonValue(jsonData, this.getReplaceObject(1));
            sendObject.data = JSON.stringify(jsonData);
        }

        let response;
        const startDate = new Date();

        await sendRequest(sendObject.options, sendObject.data).then(result => {
            response = result;
        }).catch(err => {
            response = err;
        }).finally(() => {
            response.time = getDatesDiffBySeconds(new Date(), startDate);
        });

        return response;
    },

    async sendRequestsMatrix(requestsMatrix, projectId, requestTimeout, env, userId) {
        const isOwnerValid = await isProjectOwnerValid(projectId, userId)
            .catch(errorHandler.promiseError);

        if (isOwnerValid == false) {
            return;
        }

        this.projectsRequests[projectId] = true;
        setEnvironmentOnMatrix(env.values, requestsMatrix);

        await reportsBL.initReport(requestsMatrix, projectId, userId)
            .catch(errorHandler.promiseError);

        for (let i = 0; i < requestsMatrix.length; i++) {
            for (let j = 0; j < requestsMatrix[i].length; j++) {
                requestsMatrix[i][j] = buildSendObject(requestsMatrix[i][j], requestTimeout);
            }
        }

        let promises = [];
        const requestsStartTime = new Date();

        for (let i = 0; i < requestsMatrix.length; i++) {
            promises.push(this.sendMultiRequests(requestsMatrix[i], projectId, userId));
        }

        Promise.all(promises).then(() => {
            if (this.projectsRequests[projectId]) {
                const totalTime = getDatesDiffBySeconds(new Date(), requestsStartTime);
                reportsBL.saveReport(projectId, totalTime);
                delete this.projectsRequests[projectId];
            }

            reportsBL.finishReport(projectId);
            events.emit("socket.finishReport", userId, projectId);
        });
    },

    async sendMultiRequests(sendObjects, projectId, userId) {
        for (let i = 0; i < sendObjects.length && this.projectsRequests[projectId]; i++) {
            let sendObject = sendObjects[i];
            const originalUrl = sendObject.options.hostname;
            const requestId = sendObject.requestId;

            if (sendObject.amount > config.requests.max) {
                break;
            }

            let requestsPromises = [];
            let requestStatus = {
                projectId,
                requestId,
                "success": 0,
                "fail": 0,
                "timeout": 0,
                "time": 0
            }

            reportsBL.updateRequestStart(projectId, requestId).then(() => {
                events.emit("socket.requestStart", userId, requestStatus);
            });

            let reqData = sendObject.data;

            for (let i = 1; i <= sendObject.amount && this.projectsRequests[projectId]; i++) {
                if (reqData && (jsonData = jsonTryParse(reqData))) {
                    replaceJsonValue(jsonData, this.getReplaceObject(i));
                    sendObject.data = JSON.stringify(jsonData);
                }

                sendObject.options.hostname = originalUrl;
                const startDate = new Date();

                requestsPromises.push(sendRequest(sendObject.options, sendObject.data, true).then(() => {
                    requestStatus.success++;
                }).catch((err) => {
                    if (err.timeout) {
                        requestStatus.timeout++;
                    }
                    else {
                        requestStatus.fail++;
                    }
                }).finally(() => {
                    requestStatus.time += getDatesDiffBySeconds(new Date(), startDate);
                }));
            }

            await Promise.all(requestsPromises);
            await reportsBL.updateRequestStatus(requestStatus);

            if (this.projectsRequests[projectId]) {
                events.emit("socket.requestStatus", userId, requestStatus);
            }
        }
    },

    stopRequests(projectId) {
        delete this.projectsRequests[projectId];
    },

    removeProjectReport(projectId, userId) {
        reportsBL.removeProjectReport(projectId, userId);
    }
}

function getDatesDiffBySeconds(date1, date2) {
    return Math.abs((date1.getTime() - date2.getTime()) / 1000);
}

async function isProjectOwnerValid(projectId, userId) {
    const filter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };
    const count = await DAL.count(projectsCollectionName, filter)
        .catch(errorHandler.promiseError);

    return count ? true : false;
}

function getRequestUrlData(url) {
    let data = {};
    const isHttps = isHttpsRequst(url);
    url = getUrlWithoutProtocol(url);
    const portIndex = url.indexOf(":");
    const routeIndex = url.indexOf("/");
    const portSplit = url.split(":");
    const routeSplit = url.split("/");

    if (portIndex == -1) {
        data.ip = routeSplit[0];
        data.port = isHttps ? 443 : 80;
    }
    else {
        data.ip = portSplit[0];
        data.port = routeSplit[0].substring(data.ip.length + 1);
    }

    data.path = (routeIndex != -1) ? url.substring(routeIndex) : "/";

    if (isHttps) {
        data.ip = "https://" + data.ip;
    }

    return data;
}

function buildSendObject(requestData, requestTimeout) {
    const urlData = getRequestUrlData(requestData.url);

    let sendObject = {
        options: {
            hostname: urlData.ip,
            port: urlData.port,
            path: encodeURI(urlData.path),
            method: requestData.method,
            headers: requestData.headers,
            timeout: requestTimeout
        },
        requestId: requestData.id,
        amount: requestData.amount
    }

    sendObject.options.headers["request-type"] = "bomba";
    sendObject.options.headers["cookie"] = convertCookieJsonToString(requestData.cookies);

    if (requestData.body) {
        sendObject.options.headers['Content-Type'] = 'application/json';
        sendObject.data = requestData.body;
    }

    return sendObject;
}

function convertCookieJsonToString(cookieJson) {
    let cookieKeys = Object.keys(cookieJson);
    let cookie = "";

    if (cookieKeys.length == 0) {
        return cookie;
    }

    cookieKeys.forEach(key => {
        cookie += key + "=" + cookieJson[key] + ";"
    });

    return cookie.substring(0, cookie.length - 1);
}

function isHttpsRequst(url) {
    return url.startsWith("https://");
}

function getUrlWithoutProtocol(url) {
    const protocolSplit = url.split("://");

    return (protocolSplit.length == 1) ? url : protocolSplit[1];
}

function sendRequest(options, data, isIgnoreResponse) {
    return new Promise((resolve, reject) => {

        let response = {
            data: "",
            code: null,
            timeout: false
        }

        const reqProtocol = isHttpsRequst(options.hostname) ? https : http;

        options.hostname = getUrlWithoutProtocol(options.hostname);

        const req = reqProtocol.request(options, res => {
            response.code = res.statusCode;

            res.setEncoding('utf8');
            let rawData = '';

            if (isIgnoreResponse) {
                res.on('data', () => { });
            }
            else {
                res.on('data', (chunk) => { rawData += chunk; });
            }

            res.on('end', () => {
                rawData && (response.data = rawData);

                return (response.code == 200) ? resolve(response) : reject(response);
            });
        });

        req.on('timeout', () => {
            req.abort();
            response.timeout = true;
        });

        req.on('error', (err) => {
            response.code = 500;
            response.data = err.message;

            return reject(response);
        });

        // Write data to request body.
        data && req.write(data);

        req.end();
    });
}

function replaceJsonValue(obj, replaceValues) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];

        if (typeof value == "object" && value != null) {
            replaceJsonValue(value, replaceValues);
        }
        else if (typeof value == "string") {
            Object.keys(replaceValues).forEach(replaceKey => {
                if (value.includes(replaceKey)) {
                    let replaceValue = replaceValues[replaceKey];

                    if (typeof replaceValue == "function") {
                        replaceValue = replaceValue();
                    }

                    if (value == replaceKey) {
                        obj[key] = replaceValue;
                    }
                    else {
                        obj[key] = value.replace(replaceKey, replaceValue);
                    }
                }
            });
        }
    });
}

function jsonTryParse(obj) {
    try {
        return JSON.parse(obj);
    }
    catch (e) {
        return null;
    }
}

function setEnvironmentOnMatrix(values, matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            setEnvironmentOnRequest(values, matrix[i][j])
        }
    }
}

function setEnvironmentOnRequest(values, request) {
    Object.keys(values).forEach(key => {
        const src = "{" + key + "}";
        const target = values[key];
        request.url = replaceEnvValue(request.url, src, target);
        request.body &&
            (request.body = JSON.stringify(replaceEnvValue(JSON.parse(request.body), src, target)));
        request.cookies = replaceEnvValue(request.cookies, src, target);
        request.headers = replaceEnvValue(request.headers, src, target);

        if (request.body) {
            request.body = JSON.stringify(replaceEnvValue(JSON.parse(request.body), src, target));
        }
    });
}

function replaceEnvValue(param, src, dst) {
    if (typeof param == "string") {
        return replaceAll(param, src, dst);
    }
    else if (typeof param == "object") {
        Object.keys(param).forEach(key => {
            param[key] = replaceEnvValue(param[key], src, dst);
        });
    }

    return param;
}

function replaceAll(str, src, dst) {
    return str.replace(new RegExp(src, 'g'), dst);
}