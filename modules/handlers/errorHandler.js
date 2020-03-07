const logger = require('../../logger');

module.exports = {
    promiseError(err) {
        return Promise.reject(err);
    },

    promiseSecure(err) {
        logger.secure(err);
        return Promise.reject();
    },

    routeError(err, res) {
        logger.error(err);
        res.sendStatus(500);
    }
}