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

    async sendRequestsMatrix(requestsMatrix, projectId, userId) {
        let isOwnerValid = await isProjectOwnerValid(projectId, userId)
            .catch(errorHandler.promiseError);

        if (isOwnerValid == false) {
            return;
        }

        this.projectsRequests[projectId] = true;

        await reportsBL.initReport(requestsMatrix, projectId, userId)
            .catch(errorHandler.promiseError);

        for (let i = 0; i < requestsMatrix.length; i++) {
            for (let j = 0; j < requestsMatrix[i].length; j++) {
                let requestData = requestsMatrix[i][j];
                requestsMatrix[i][j] = buildSendObject(requestData);
            }
        }

        let promises = [];
        let requestsStartTime = new Date();

        for (let i = 0; i < requestsMatrix.length; i++) {
            promises.push(this.sendMultiRequests(requestsMatrix[i], projectId, userId));
        }

        Promise.all(promises).then(() => {
            if (this.projectsRequests[projectId]) {
                let totalTime = getDatesDiffBySeconds(new Date(), requestsStartTime);
                reportsBL.saveReport(projectId, totalTime);
                delete this.projectsRequests[projectId];
            }

            reportsBL.finishReport(projectId);
            events.emit("socket.finishReport", userId, projectId);
        });
    },

    async sendMultiRequests(sendObjects, projectId, userId) {
        for (let i = 0; i < sendObjects.length && this.projectsRequests[projectId]; i++) {
            const sendObject = sendObjects[i];
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
                "time": 0
            }

            reportsBL.updateRequestStart(projectId, requestId).then(() => {
                events.emit("socket.requestStart", userId, requestStatus);
            });

            for (let i = 1; i <= sendObject.amount && this.projectsRequests[projectId]; i++) {
                if (sendObject.jsonData) {
                    let jsonData = Object.assign({}, sendObject.jsonData);

                    replaceJsonValue(jsonData, {
                        "{number}": i,
                        "{string}": i.toString(),
                        "{date}": new Date(),
                        "{iso}": new Date().toISOString(),
                        "{random}": generator.generateId()
                    });

                    sendObject.data = JSON.stringify(jsonData);
                }

                let startTime = new Date();

                requestsPromises.push(sendRequest(sendObject.options, sendObject.data).then(() => {
                    requestStatus.success++;
                }).catch(() => {
                    requestStatus.fail++;
                }).finally(async () => {
                    requestStatus.time += getDatesDiffBySeconds(new Date(), startTime);
                }));
            }

            await Promise.all(requestsPromises);
            reportsBL.updateRequestStatus(requestStatus).then(() => {
                events.emit("socket.requestStatus", userId, requestStatus);
            });
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
    let filter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };
    let count = await DAL.count(projectsCollectionName, filter)
        .catch(errorHandler.promiseError);

    return count ? true : false;
}

function getRequestUrlData(url) {
    let data = {};
    let isHttps = isHttpsRequst(url);
    url = getUrlWithoutProtocol(url);
    let portIndex = url.indexOf(":");
    let routeIndex = url.indexOf("/");
    let portSplit = url.split(":");
    let routeSplit = url.split("/");

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

function buildSendObject(requestData) {
    let urlData = getRequestUrlData(requestData.url);

    let sendObject = {
        options: {
            hostname: urlData.ip,
            port: urlData.port,
            path: urlData.path,
            method: requestData.method,
            headers: {}
        },
        requestId: requestData.id,
        amount: requestData.amount
    }

    if (config.server.isProd) {
        sendObject.options.headers['type'] = 'bomba';
    }

    if (requestData.body && requestData.body.template) {
        if (requestData.body.type == "json") {
            sendObject.options.headers['Content-Type'] = 'application/json';
            sendObject.jsonData = jsonTryParse(requestData.body.template);
        }

        sendObject.data = requestData.body.template;
    }

    return sendObject;
}

function isHttpsRequst(url) {
    return url.startsWith("https://");
}

function getUrlWithoutProtocol(url) {
    const protocolSign = "://";
    const protocolSplit = url.split(protocolSign);

    return (protocolSplit.length == 1) ? url : protocolSplit[1];
}

function isLocalRequest(url) {
    url = getUrlWithoutProtocol(url).toLowerCase();

    return (url == "localhost" || url == "127.0.0.1" || url == config.server.dns);
}

function sendRequest(options, data) {
    return new Promise((resolve, reject) => {

        if (config.server.isProd && isLocalRequest(options.hostname)) {
            reject();
        }

        let reqProtocol;

        if (isHttpsRequst(options.hostname)) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            reqProtocol = https;
        }
        else {
            reqProtocol = http;
        }

        options.hostname = getUrlWithoutProtocol(options.hostname);

        const req = reqProtocol.request(options, res => {
            if (res.statusCode != 200) {
                return reject();
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                if (!rawData) {
                    resolve();
                }
                else {
                    resolve(jsonTryParse(rawData) || rawData);
                }
            });
        });

        req.on('timeout', () => {
            req.abort();
        });

        req.on('error', (err) => {
            return reject(err);
        });

        // Write data to request body.
        data && req.write(data);

        req.end();
    });
}

function replaceJsonValue(obj, replaceValues) {
    Object.keys(obj).forEach(key => {
        let value = obj[key];

        if (typeof value == "object" && value != null) {
            replaceJsonValue(value, replaceValues);
        }
        else if (typeof value == "string") {
            Object.keys(replaceValues).forEach(replaceKey => {
                if (value.includes(replaceKey)) {
                    if (value == replaceKey) {
                        obj[key] = replaceValues[replaceKey];
                    }
                    else {
                        obj[key] = value.replace(replaceKey, replaceValues[replaceKey]);
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