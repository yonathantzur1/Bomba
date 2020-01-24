const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const config = require('./config');

process.on('uncaughtException', err => {
    console.error(err);
});

process.on('unhandledRejection', err => {
    console.error(err);
});

// app define settings.
app.enable('trust proxy');
app.use(bodyParser.json({ limit: config.server.maxRequestSize }));
app.use(bodyParser.urlencoded({
    limit: config.server.maxRequestSize,
    extended: true
}));
app.use(express.static('./'));


http.listen(config.server.port, () => {
    console.log("Server is up!");
});