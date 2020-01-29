const http = require('http');

module.exports = {
    async sendRequestsMatrix(requestsMatrix) {
        let sendObjects = [];

        for (let i = 0; i < requestsMatrix.length; i++) {
            for (let j = 0; j < requestsMatrix[i].length; j++) {
                let requestData = requestsMatrix[i][j];
                sendObjects.push(buildSendObject(requestData, i, j));
            }

            await sendMultiRequests(sendObjects);
            sendObjects = [];
        }

        return;
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

function sendMultiRequests(sendObjects) {
    return Promise.all(sendObjects.map(sendObject => {
        return new Promise((resolve, reject) => {
            let position = sendObject.position;
            sendRequest(sendObject.options, sendObject.data).then(response => {
                // TODO: report client - request succeeded.
                resolve();
            }).catch(err => {
                // TODO: report client - request failed.
                resolve();
            });
        });
    }));
}

function sendRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
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
                    catch(e) {
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