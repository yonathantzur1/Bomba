const router = require('express').Router();
const errorHandler = require('../handlers/errorHandler');

const environmentsBL = require('../BL/environmentsBL');

router.post('/addEnv', (req, res) => {
    environmentsBL.addEnv(req.body.projectId, req.body.env, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/updateEnv', (req, res) => {
    environmentsBL.updateEnv(req.body.projectId, req.body.env, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.delete('/deleteEnv', (req, res) => {
    environmentsBL.deleteEnv(req.query.projectId, req.query.envId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/setActiveEnv', (req, res) => {
    environmentsBL.setActiveEnv(req.body.projectId, req.body.envId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;