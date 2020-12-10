const router = require('express').Router();
const loginBL = require('../BL/loginBL');
const registerBL = require('../BL/registerBL');
const logsBL = require('../BL/logsBL');
const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');
const validator = require('../security/validations/validator');
const limitter = require('../security/limitter');

// Validate the user details and login the user.
router.post('/userLogin', validator,
    (req, res, next) => {
        req.body.username = req.body.username.toLowerCase();

        // Define limitter key.
        req.limitterKey = req.body.username;
        next();
    },
    limitter,
    (req, res) => {
        loginBL.getUser(req.body).then(user => {
            if (user) {
                if (user.verification.isVerified) {
                    tokenHandler.setTokenOnCookie(tokenHandler.getTokenFromUserObject(user), res);
                    res.send({ result: true });
                }
                else {
                    const resultObj = { result: user.uid };

                    if (registerBL.isVerificationDateExpired(user.verification.date)) {
                        registerBL.resendVerification(user.uid).then(result => {
                            res.send(resultObj);
                        });
                    }
                    else {
                        res.send(resultObj);
                    }
                }
            }
            // In case the password is wrong or the user does not exist.
            else {
                res.send({ result: false });

                // In case the password is wrong.
                if (user == false) {
                    logsBL.loginFail(req.body.username, req);
                }
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
