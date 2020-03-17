const router = require('express').Router();
const boardBL = require('../BL/boardBL');

const errorHandler = require('../handlers/errorHandler');

// Checking if the session of the user is open.
router.get('/getProjectBoard', (req, res) => {
    boardBL.getProjectBoard(req.query.projectId, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/saveMatrix', (req, res) => {
    boardBL.saveMatrix(req.body.projectId, req.user._id, req.body.matrix).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/saveRequests', (req, res) => {
    boardBL.saveRequests(req.body.projectId, req.user._id, req.body.requests).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;