const router = require('express').Router();
const errorHandler = require('../handlers/errorHandler');

const reportsBL = require('../BL/reportsBL');

router.delete('/removeReport', (req, res) => {
    reportsBL.removeReport(req.query.projectId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.post('/saveReport', (req, res) => {
    reportsBL.saveReport(req.body.projectId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/getAllReports', (req, res) => {
    reportsBL.getAllReports(req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;