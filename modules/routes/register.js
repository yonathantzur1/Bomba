const router = require('express').Router();
const tokenHandler = require('../handlers/tokenHandler');
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');
const logsBL = require('../BL/logsBL');

const registerBL = require('../BL/registerBL');

router.post('/register', validator,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        req.body.username = req.body.username.toLowerCase();
        next();
    },
    (req, res) => {
        registerBL.addUser(req.body).then(result => {
            if (!result) {
                res.send({ result });
            }
            else if (!result.isValid) {
                res.send({ "result": result.data });
            }
            else {
                const user = result.data;
                res.send({ result: user.uid });
                logsBL.register(user.username, req);
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.put('/verifyUser', validator, (req, res) => {
    registerBL.verifyUser(req.body.verificationCode).then(result => {
        tokenHandler.deleteAuthCookies(res);
        res.send({ result });
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/getVerificationUserData', validator, (req, res) => {
    registerBL.getVerificationUserData(req.query.userUid).then(result => {
        tokenHandler.deleteAuthCookies(res);
        res.send({ result });
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/resendVerification', validator, (req, res) => {
    registerBL.resendVerification(req.body.userUid).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;