const DAL = require('../DAL');
const config = require('../../config');
const requestHandler = require('../handlers/requestHandler');
const LOG_TYPE = require('../enums').LOG_TYPE;

let logsCollectionName = config.db.collections.logs;

module.exports = {
    register(username, req) {
        insertLog(
            LOG_TYPE.REGISTER,
            username,
            req
        );
    },

    login(username, req) {
        insertLog(
            LOG_TYPE.LOGIN,
            username,
            req
        );
    },

    loginFail(username, req) {
        insertLog(
            LOG_TYPE.LOGIN_FAIL,
            username,
            req
        );
    }
};

function insertLog(type, username, req) {
    if (!config.server.isProd) {
        return;
    }

    DAL.insert(logsCollectionName, {
        type,
        ip: requestHandler.getIpFromRequest(req),
        userAgent: requestHandler.getUserAgentFromRequest(req),
        username,
        date: new Date()
    });
}