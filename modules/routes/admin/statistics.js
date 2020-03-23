const router = require('express').Router();
const statisticsBL = require('../../BL/admin/statisticsBL');
const errorHandler = require('../../handlers/errorHandler');

router.get('/getStatistics', (req, res) => {
    statisticsBL.getStatistics().then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;