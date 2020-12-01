const router = require('express').Router();
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');

const forgotPasswordBL = require('../BL/forgotPasswordBL');

router.post('/restorePassword', (req, res) => {
    forgotPasswordBL.restorePassword(req.body.username).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/isResetCodeValid', (req, res) => {
    forgotPasswordBL.isResetCodeValid(req.query.resetCode).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/setPassword', (req, res) => {
    forgotPasswordBL.setPassword(req.body.resetPassword, req.body.password).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;