const router = require('express').Router();
const usersBL = require('../../BL/admin/usersBL');
const errorHandler = require('../../handlers/errorHandler');
const validator = require('../../security/validations/validator');

router.post('/getUser',
    (req, res, next) => {
        req.body.searchInput = req.body.searchInput.toLowerCase();
        next();
    },
    (req, res) => {
        usersBL.getUser(req.body.searchInput).then(result => {
            res.send(result);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.put('/changeAdminStatus', (req, res) => {
    usersBL.changeAdminStatus(req.body.userId, req.body.isAdmin).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/saveUserEdit',
    validator,
    (req, res) => {
        usersBL.saveUserEdit(req.body).then(result => {
            res.send({ result });
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.put('/deleteUser', (req, res) => {
    usersBL.deleteUser(req.query.userId).then(result => {
        res.send(!!result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;