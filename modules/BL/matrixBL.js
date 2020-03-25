const DAL = require('../DAL');
const resultsBL = require('./resultsBL');
const config = require('../../config');
const http = require('http');
const https = require('https');
const events = require('../events');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    projectsRequests: {},

    async sendRequestsMatrix(requestsMatrix, projectId, userId) {
        if (await isProjectOwnerValid(projectId, userId) == false) {
            return;
        }

        this.projectsRequests[projectId] = true;

        let resultId = await resultsBL.initResults(requestsMatrix, projectId, userId);

        for (let i = 0; i < requestsMatrix.length; i++) {
            for (let j = 0; j < requestsMatrix[i].length; j++) {
                let requestData = requestsMatrix[i][j];
                requestsMatrix[i][j] = buildSendObject(requestData);
            }
        }

        let promises = [];

        for (let i = 0; i < requestsMatrix.length; i++) {
            promises.push(this.sendMultiRequests(requestsMatrix[i], projectId, userId, resultId));
        }

        Promise.all(promises).then(data => {
            delete this.projectsRequests[projectId];
        });
    },

    async sendMultiRequests(sendObjects, projectId, userId, resultId) {
        for (let i = 0; i < sendObjects.length && this.projectsRequests[projectId]; i++) {
            const sendObject = sendObjects[i];
            const requestId = sendObject.requestId;

            for (let i = 0; i < sendObject.amount && this.projectsRequests[projectId]; i++) {
                let result = { projectId, requestId };
                let isRequestSuccess = true;
                let startTime;

                try {
                    if (sendObject.jsonData) {
                        let jsonData = Object.assign({}, sendObject.jsonData);

                        replaceJsonValue(jsonData, {
                            "{number}": i,
                            "{string}": i.toString(),
                            "{date}": new Date(),
                            "{iso}": new Date().toISOString()
                        });

                        sendObject.data = JSON.stringify(jsonData);
                    }

                    startTime = new Date();
                    result.response = await sendRequest(sendObject.options, sendObject.data);
                }
                catch (e) {
                    isRequestSuccess = false;
                }

                result.time = getDatesDiffBySeconds(new Date(), startTime);
                await resultsBL.updateResult(resultId, requestId,
                    isRequestSuccess ? "success" : "fail", result.time);
                events.emit(isRequestSuccess ? "socket.requestSuccess" : "socket.requestError",
                    userId, result);
            }
        }
    },

    stopRequests(projectId, userId) {
        delete this.projectsRequests[projectId];
        resultsBL.removeResults(projectId, userId);
    }
}

function getDatesDiffBySeconds(date1, date2) {
    return Math.abs((date1.getTime() - date2.getTime()) / 1000);
}

async function isProjectOwnerValid(projectId, userId) {
    let filter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };
    let count = await DAL.count(projectsCollectionName, filter);

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
            method: requestData.method
        },
        requestId: requestData.id,
        amount: requestData.amount
    }

    if (requestData.body && requestData.body.template) {
        if (requestData.body.type == "json") {
            sendObject.options.headers = { 'Content-Type': 'application/json' };
            sendObject.jsonData = jsonTryParse(requestData.body.template);
        }

        sendObject.data = requestData.body.template;
    }

    return sendObject;
}

function isHttpsRequst(url) {
    return (url.indexOf("https://") == 0);
}

function getUrlWithoutProtocol(url) {
    const protocolSign = "://";
    const protocolSplit = url.split(protocolSign);

    return (protocolSplit.length == 1) ? url : protocolSplit[1];
}

function sendRequest(options, data) {
    return new Promise((resolve, reject) => {
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
        else if (typeof value == "string" &&
            Object.keys(replaceValues).includes(value)) {
            obj[key] = replaceValues[value];
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