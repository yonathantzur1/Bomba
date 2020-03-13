const router = require('express').Router();
const loginBL = require('../BL/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');
const validator = require('../security/validations/validator');
const limitter = require('../security/limitter');

// Validate the user details and login the user.
router.post('/userLogin',
    validator,
    (req, res, next) => {
        req.body.username = req.body.username.toLowerCase();

        // Define limitter key.
        req.limitterKey = req.body.username;
        next();
    },
    limitter,
    (req, res) => {
        // Input: { username, password }
        // Output: result ->
        // (result == false): wrong password.
        // (result == "-1"): username is not exists on DB.
        // else: username and password are valid.
        loginBL.getUser(req.body).then(user => {
            if (user) {
                // In case the username is not exists on DB.
                if (user == "-1") {
                    res.send({ result: user });
                }
                // In case user username and password are valid.
                else {
                    tokenHandler.setTokenOnCookie(tokenHandler.getTokenFromUserObject(user), res);
                    res.send({ result: true });
                }
            }
            // In case the password is wrong.
            else {
                res.send({ result: user });
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

// Delete token from cookies.
router.delete('/deleteToken', (req, res) => {
    tokenHandler.deleteTokenFromCookie(res);
    res.send(true);
});

module.exports = router;