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

function buildSendObject(requestData, xIndex, yIndex) {
    let sendObject = {
        options: {
            hostname: requestData.ip,
            port: requestData.port,
            path: requestData.url,
            method: requestData.method
        },
        position: { xIndex, yIndex }
    }

    if (requestData.data) {
        sendObject.options.headers = { 'Content-Type': 'application/json' };
        sendObject.data = JSON.stringify(requestData.data);
    }

    return sendObject;
}

async function sendMultiRequests(sendObjects) {
    for (let i = 0; i < sendObjects.length; i++) {
        const sendObject = sendObjects[i];
        const position = sendObject.position;

        try {
            let response = await sendRequest(sendObject.options, sendObject.data);
            // TODO: report client request success.
        }
        catch (e) {
            // TODO: report client request failed.
        }
    }
}

function isHttpsRequst(url) {
    return (url.indexOf("https://") == 0);
}

function getUrlWithoutProtocol(url) {
    const protocolSign = "://";
    const protocolIndex = url.indexOf(protocolSign);

    if (protocolIndex == -1) {
        return url;
    }
    else {
        return url.substring(protocolIndex + protocolSign.length, url.length);
    }
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