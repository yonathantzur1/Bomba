const router = require('express').Router();
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');

const projectsBL = require('../BL/projectsBL');

router.get('/getProjects', (req, res) => {
    projectsBL.getProjects(req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.post('/addProject', validator,
    (req, res, next) => {
        req.body.name = req.body.name.trim();
        next();
    },
    (req, res) => {
        projectsBL.addProject(req.body.name, req.user._id).then(result => {
            res.send({ result });
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.put('/editProject', validator,
    (req, res, next) => {
        req.body.name = req.body.name.trim();
        next();
    },
    (req, res) => {
        projectsBL.editProject(req.body.id, req.body.name, req.user._id).then(result => {
            res.send({ result });
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.delete('/deleteProject', validator,
    (req, res) => {
        projectsBL.deleteProject(req.query.id, req.user._id).then(result => {
            res.send(!!result);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.put('/saveRequestSettings', (req, res) => {
    projectsBL.saveRequestSettings(req.body.id, req.body.defaultSettings, req.user._id).then(result => {
        res.send(!!result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;