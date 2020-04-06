const router = require('express').Router();
const tokenHandler = require('../handlers/tokenHandler');
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');
const logsBL = require('../BL/logsBL');

const registerBL = require('../BL/registerBL');

// Add new user to the DB and make sure the username is not already exists.
router.post('/register',
    validator,
    (req, res, next) => {
        req.body.username = req.body.username.toLowerCase();
        next();
    },
    (req, res) => {
        registerBL.addUser(req.body).then(user => {
            if (!user) {
                res.send({ result: user });
            }
            else {
                let token = tokenHandler.getTokenFromUserObject(user);
                tokenHandler.setTokenOnCookie(token, res);
                res.send({ result: true });
                logsBL.register(user.username, req);
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;