const router = require('express').Router();
const loginBL = require('../BL/loginBL');
const logsBL = require('../BL/logsBL');
const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');

// Getting the current login user.
router.get('/getCurrUser', (req, res) => {
    const user = {
        "username": req.user.username,
        "isAdmin": req.user.isAdmin
    }

    logsBL.login(user.username, req);
    loginBL.updateLastLogin(req.user._id);
    res.send(user);
});

// Checking if the user session is open.
router.get('/isUserOnSession', (req, res) => {
    if (!tokenHandler.validateUserAuthCookies(req)) {
        res.send(false);
    }
    else {
        loginBL.getUserById(req.user._id).then(user => {
            let cookieUid = tokenHandler.getUidFromRequest(req);

            // Second check of user uid (after main server token validae middleware)
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

router.get('/isUserAdmin', (req, res) => {
    res.send(req.user && req.user.isAdmin);
});

router.get('/deleteClientAuth', (req, res) => {
    tokenHandler.deleteAuthCookies(res);
    res.end();
});

module.exports = router;