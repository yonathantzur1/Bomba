const router = require('express').Router();
const projectsBL = require('../BL/projectsBL');
const errorHandler = require('../handlers/errorHandler');

router.get('/getApiKey', (req, res) => {
    res.send({ "key": req.user.apiKey });
});

router.get('/getProjectsForApi', (req, res) => {
    projectsBL.getProjectsForApi(req.user._id).then(result => {
        res.send(result.map(project => {
            project.environments = project.environments.map(env => env.name);

            return project;
        }));
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;