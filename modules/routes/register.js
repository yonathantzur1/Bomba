const router = require('express').Router();
const registerBL = require('../BL/registerBL');
const tokenHandler = require('../handlers/tokenHandler');
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');

// Add new user to the DB and make sure the username is not already exists.
router.post('/register',
    validator,
    (req, res, next) => {
        req.body.username = req.body.username.toLowerCase();
        next();
    },
    (req, res) => {
        registerBL.addUser(req.body).then(result => {
            // In case the username is exists.
            if (!result) {
                res.send({ result });
            }
            else {
                let token = tokenHandler.getTokenFromUserObject(result);
                tokenHandler.setTokenOnCookie(token, res);
                res.send({ "result": true });
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;