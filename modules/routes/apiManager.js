const router = require('express').Router();
const apiManagerBL = require('../BL/apiManagerBL');
const projectsBL = require('../BL/projectsBL');
const errorHandler = require('../handlers/errorHandler');

router.get('/getApiKey', (req, res) => {
    res.send({ "key": req.user.apiKey });
});

router.get('/getUserProjects', (req, res) => {
    projectsBL.getProjectsNames(req.user._id).then(result => {
        res.send(result.map(project => project.name));
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;