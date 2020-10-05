const jwt = require('jsonwebtoken');
const config = require('../../config');
const encryption = require('../security/encryption');

const self = module.exports = {
    getTokenFromUserObject(user) {
        let tokenUserObject = {
            "_id": user._id,
            "uid": user.uid,
            "username": user.username,
            "isAdmin": user.isAdmin,
            "apiKey": user.apiKey
        }

        let tokenObject = { "user": tokenUserObject };
        let token = encryption.encrypt(jwt.sign(tokenObject,
            config.security.jwt.secret,
            config.security.jwt.options));

        return token;
    },

    decodeToken(token) {
        try {
            return jwt.verify(encryption.decrypt(token), config.security.jwt.secret);
        }
        catch (err) {
            return null;
        }
    },

    decodeTokenFromRequest(request) {
        let token = this.getTokenFromRequest(request);
        return this.decodeToken(token);
    },

    decodeTokenFromSocket(socket) {
        let token = this.getTokenFromSocket(socket);
        return this.decodeToken(token);
    },

    setTokenOnCookie(token, res, isPreventUidCookie) {
        res.cookie(config.security.token.cookieName,
            token,
            { maxAge: config.security.token.maxAge, httpOnly: true });

        token = this.decodeToken(token);

        if (token.user && !isPreventUidCookie) {
            res.cookie(config.security.token.uidCookieName,
                token.user.uid,
                { maxAge: config.security.token.maxAge, httpOnly: false });
        }
    },

    deleteTokenFromCookie(res) {
        res.clearCookie(config.security.token.cookieName);
    },

    deleteUidFromCookie(res) {
        res.clearCookie(config.security.token.uidCookieName);
    },

    deleteSocketFromCookie(res) {
        res.clearCookie(config.security.token.socketCookieName);
    },

    deleteAuthCookies(res) {
        this.deleteTokenFromCookie(res);
        this.deleteUidFromCookie(res);
        this.deleteSocketFromCookie(res);
    },

    getTokenFromCookie(cookie) {
        return getCookieByName(config.security.token.cookieName, cookie);
    },

    getTokenFromSocket(socket) {
        return getCookieByName(config.security.token.cookieName, socket.request.headers.cookie);
    },

    getTokenFromRequest(request) {
        return getCookieByName(config.security.token.cookieName, request.headers.cookie);
    },

    getUidFromRequest(request) {
        return getCookieByName(config.security.token.uidCookieName, request.headers.cookie);
    },

    validateUserAuthCookies(request) {
        let token = self.decodeTokenFromRequest(request);
        let cookieUid = self.getUidFromRequest(request);

        // Return if the user is login and authorized.
        if (token && token.user.uid == cookieUid) {
            request.user = token.user;
            return true;
        }
        else {
            return false;
        }
    }
};

function getCookieByName(cname, cookie) {
    if (!cookie) {
        return '';
    }

    let name = cname + "=";
    let ca = cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return '';
}