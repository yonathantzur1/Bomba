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

router.post('/addProject',
    validator,
    (req, res) => {
        projectsBL.addProject(req.body.name, req.user._id).then(result => {
            res.send({ result });
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.delete('/deleteProject', (req, res) => {
    projectsBL.deleteProject(req.query.id).then(result => {
        res.send(result ? true : false);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;