const router = require('express').Router();
const loginBL = require('../BL/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');

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

module.exports = router;