const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, printf } = format;
const path = require('path');
const config = require('./config');

const logsDir = path.join(__dirname, config.logs.directoryName);

const logFormat = printf(info => {
    const data = info.message || "";
    const level = info.level;
    const timestamp = info.timestamp;

    let message = (typeof data == "object") ? JSON.stringify(data) : data.toString();

    let log = { message, level, timestamp }

    info.stack && (log.stack = info.stack);

    return JSON.stringify(log);
});

const loggerFormat = combine(
    timestamp(),
    json(),
    logFormat
);

function createTransport(logName) {
    return new transports.File({
        filename: path.join(logsDir, logName),
        maxsize: config.logs.maxLogSize,
        maxFiles: config.logs.maxLogFiles
    });
}

const logger = createLogger({
    format: loggerFormat,
    transports: [
        createTransport(config.logs.mainLogName)
    ]
});

const secure = createLogger({
    format: loggerFormat,
    transports: [
        createTransport(config.logs.secureLogName)
    ]
});

// Print log to console in case the environment is not prod.
if (!config.server.isProd) {
    logger.add(new transports.Console({}));
    secure.add(new transports.Console({}));
}

module.exports = {
    info: data => {
        logData(logger.info, data);
    },

    error: data => {
        logData(logger.error, data);
    },

    warn: data => {
        logData(logger.warn, data);
    },

    secure: data => {
        logData(secure.warn, data);
    }
};

function logData(logger, data) {
    data && logger(data);
}