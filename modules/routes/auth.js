const router = require('express').Router();
const loginBL = require('../BL/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');
const enums = require('../enums');

// Getting the current login user.
router.get('/getCurrUser', (req, res) => {
    let user = req.user;

    // Return user with only specific details.
    let userClientObject = {
        "_id": user._id,
        "username": user.username
    }

    loginBL.updateLastLogin(user._id);
    res.send(userClientObject);
});

// Checking if the session of the user is open.
router.get('/isUserOnSession', (req, res) => {
    if (!tokenHandler.validateUserAuthCookies(req)) {
        res.send(false);
    }
    else {
        loginBL.getUserById(req.user._id).then(user => {
            let cookieUid = tokenHandler.getUidFromRequest(req);

            // Double check uid (after main server token validae middleware)
            // from the original DB user object.
            if (user && user.uid == cookieUid) {
                tokenHandler.setTokenOnCookie(tokenHandler.getTokenFromUserObject(user), res, true);
                res.send(true);
            }
            else {
                res.send(false);
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    }
});

router.get('/isUserSocketConnect', (req, res) => {
    let state;

    // In case the user is logout.
    if (!tokenHandler.validateUserAuthCookies(req)) {
        state = enums.SOCKET_STATE.LOGOUT;
    }
    else {
        let socketUser = req.connectedUsers[req.user._id];
        state = socketUser ? enums.SOCKET_STATE.ACTIVE : enums.SOCKET_STATE.CLOSE;
    }

    res.send({ state });
});

router.get('/isUserAdmin', (req, res) => {
    res.send(req.user && req.user.isAdmin);
});

router.get('/deleteClientAuth', (req, res) => {
    tokenHandler.deleteAuthCookies(res);
    res.end();
});

module.exports = router;