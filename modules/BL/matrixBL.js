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

                try {
                    let response = await sendRequest(sendObject.options, sendObject.data);
                    await resultsBL.increaseResultState(resultId, requestId, "success");
                    events.emit("socket.requestSuccess", userId, result);
                }
                catch (e) {
                    await resultsBL.increaseResultState(resultId, requestId, "fail");
                    events.emit("socket.requestError", userId, result);
                }
            }
        }
    },

    stopRequests(projectId, userId) {
        delete this.projectsRequests[projectId];
        resultsBL.removeResults(projectId, userId);
    }
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
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    }
                    // In case the response data is not a json.
                    catch (e) {
                        resolve(rawData);
                    }
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