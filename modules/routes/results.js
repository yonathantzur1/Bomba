const router = require('express').Router();
const errorHandler = require('../handlers/errorHandler');

const resultsBL = require('../BL/resultsBL');

router.get('/getResults', (req, res) => {
    resultsBL.getResults(req.query.projectId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.delete('/removeResults', (req, res) => {
    resultsBL.removeResults(req.query.projectId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;