const http = require('http');
const https = require('https');

module.exports = {
    sendRequestsMatrix(requestsMatrix) {
        for (let i = 0; i < requestsMatrix.length; i++) {
            for (let j = 0; j < requestsMatrix[i].length; j++) {
                let requestData = requestsMatrix[i][j];
                requestsMatrix[i][j] = buildSendObject(requestData, i, j);
            }
        }

        for (let i = 0; i < requestsMatrix.length; i++) {
            sendMultiRequests(requestsMatrix[i]);
        }
    }
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

function buildSendObject(requestData, xIndex, yIndex) {
    let urlData = getRequestUrlData(requestData.url);

    let sendObject = {
        options: {
            hostname: urlData.ip,
            port: urlData.port,
            path: urlData.path,
            method: requestData.method
        },
        position: { xIndex, yIndex },
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

async function sendMultiRequests(sendObjects) {
    for (let i = 0; i < sendObjects.length; i++) {
        const sendObject = sendObjects[i];
        const position = sendObject.position;

        for (let i = 0; i < sendObject.amount; i++) {
            try {
                let response = await sendRequest(sendObject.options, sendObject.data);
                // TODO: report client request success.   
            }
            catch (e) {
                // TODO: report client request failed.
            }
        }
    }
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