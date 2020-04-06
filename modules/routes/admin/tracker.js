const router = require('express').Router();
const trackerBL = require('../../BL/admin/trackerBL');
const errorHandler = require('../../handlers/errorHandler');

router.post('/getChartData',
    (req, res, next) => {
        if (req.body.username) {
            req.body.username = req.body.username.toLowerCase();
        }

        next();
    },
    (req, res) => {
        trackerBL.getLogData(req.body.logType,
            req.body.range,
            req.body.datesRange,
            req.body.clientTimeZone,
            req.body.username).then(result => {
                res.send(result);
            }).catch(err => {
                errorHandler.routeError(err, res);
            });
    });

router.get('/isUserExists',
    (req, res, next) => {
        req.query.username = req.query.username.toLowerCase();
        next();
    },
    (req, res) => {
        trackerBL.isUserExists(req.query.username).then(result => {
            res.send(result);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;