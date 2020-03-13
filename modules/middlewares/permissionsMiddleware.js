const tokenHandler = require('../handlers/tokenHandler');

module.exports = {
    auth(req, res, next) {
        tokenHandler.validateUserAuthCookies(req) ? next() : res.sendStatus(401);
    },

    admin(req, res, next) {
        req.user.isAdmin ? next() : res.sendStatus(401);
    }
};