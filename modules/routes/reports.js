const router = require('express').Router();
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');

const reportsBL = require('../BL/reportsBL');

router.put('/setReportName', validator, (req, res) => {
    reportsBL.setReportName(req.body.reportId, req.body.projectId,
        req.body.name, req.user._id).then(result => {
            res.send(result);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
});

router.delete('/removeProjectReport', (req, res) => {
    reportsBL.removeProjectReport(req.query.projectId, req.user._id).then(result => {
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

router.get('/getProjectReports', (req, res) => {
    reportsBL.getProjectReports(req.query.projectId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/getReportData', (req, res) => {
    reportsBL.getReportData(req.query.reportId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.delete('/deleteReport', (req, res) => {
    reportsBL.deleteReport(req.query.projectId, req.query.reportId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.delete('/deleteFolder', (req, res) => {
    reportsBL.deleteFolder(req.query.projectId, req.user._id).then(result => {
        res.send(!!result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;