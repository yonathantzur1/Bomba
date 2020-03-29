const DAL = require('../DAL');
const reportsBL = require('./reportsBL');
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

        await reportsBL.initReport(requestsMatrix, projectId, userId);

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
            let totalTime = getDatesDiffBySeconds(new Date(), requestsStartTime)
            delete this.projectsRequests[projectId];
            reportsBL.finishReport(projectId);
            reportsBL.saveReport(projectId, totalTime);
            events.emit("socket.finishReport", userId, projectId);
        });
    },

    async sendMultiRequests(sendObjects, projectId, userId) {
        for (let i = 0; i < sendObjects.length && this.projectsRequests[projectId]; i++) {
            const sendObject = sendObjects[i];
            const requestId = sendObject.requestId;

            let requestsPromises = [];

            for (let i = 1; i <= sendObject.amount && this.projectsRequests[projectId]; i++) {
                let clientResult = { projectId, requestId };
                let startTime;

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

                let isRequestSuccess;
                startTime = new Date();

                reportsBL.updateRequestStart(projectId, requestId).then(() => {
                    events.emit("socket.requestStart", userId, clientResult);
                });

                requestsPromises.push(sendRequest(sendObject.options, sendObject.data).then(() => {
                    isRequestSuccess = true;
                }).catch(() => {
                    isRequestSuccess = false;
                }).finally(async () => {
                    clientResult.time = getDatesDiffBySeconds(new Date(), startTime);
                    reportsBL.updateRequestResult(projectId, requestId,
                        isRequestSuccess ? "success" : "fail", clientResult.time).then(() => {
                            events.emit(isRequestSuccess ? "socket.requestSuccess" : "socket.requestError",
                                userId, clientResult);
                        });
                }));
            }

            await Promise.all(requestsPromises);
        }
    },

    stopRequests(projectId, userId) {
        delete this.projectsRequests[projectId];
        reportsBL.removeReport(projectId, userId);
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