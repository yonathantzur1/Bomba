const router = require('express').Router();
const validator = require('../security/validations/validator');
const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');

const forgotPasswordBL = require('../BL/forgotPasswordBL');

router.post('/restorePassword', (req, res) => {
    forgotPasswordBL.restorePassword(req.body.username).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/isResetCodeValid', validator, (req, res) => {
    tokenHandler.deleteAuthCookies(res);
    forgotPasswordBL.isResetCodeValid(req.query.resetCode).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/setPassword', validator, (req, res) => {
    forgotPasswordBL.setPassword(req.body.resetCode, req.body.password).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;