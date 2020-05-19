const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const secure = require('ssl-express-www');

process.on('uncaughtException', err => {
    console.error(err);
});

process.on('unhandledRejection', err => {
    console.error(err);
});

// app define settings.
config.server.isForceHttps && app.use(secure);
app.enable('trust proxy');
app.use(bodyParser.json({ limit: config.server.maxRequestSize }));
app.use(bodyParser.urlencoded({
    limit: config.server.maxRequestSize,
    extended: true
}));
app.use(express.static('./'));

// Allow remote https requests.
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Reject requests from bomba users.
app.use((req, res, next) => {
    if (req.headers["type"] == "bomba") {
        res.status(500).end();
    }
    else {
        next();
    }
});

require('./modules/sockets/socket')(io);

// Import routes.
require('./modules/routes/main')(app);

// Allowed files extensions list.
const allowedExt = [
    '.js', '.ico', '.css', '.png', '.jpg',
    '.woff2', '.woff', '.ttf', '.svg',
];

function isFileAllow(reqUrl) {
    return (allowedExt.filter(ext => reqUrl.indexOf(ext) > 0).length > 0);
}

// Redirect angular requests back to client side.
app.get('/*', (req, res) => {
    let buildFolder = 'dist/';
    let file = isFileAllow(req.url) ? req.url : 'index.html';
    let filePath = path.resolve(buildFolder + file);

    res.sendFile(filePath);
});

http.listen(config.server.port, () => {
    (!config.server.isProd) && console.log("Server is up!");
});