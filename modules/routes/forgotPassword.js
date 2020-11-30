const router = require('express').Router();
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');

const forgotPasswordBL = require('../BL/forgotPasswordBL');

router.post('/restorePassword', (req, res) => {
    forgotPasswordBL.restorePassword(req.body.username).then(result => {
        res.send(!!result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;