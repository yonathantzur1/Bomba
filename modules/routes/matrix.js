const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');
const events = require('../events');
const pubsub = require("../pubsub")();

const errorHandler = require('../handlers/errorHandler');

pubsub && pubsub.subscribe(pubsub.channels.stopRequests).then(result => {
    result && pubsub.onMessage((channel, message) => {
        if (channel == pubsub.channels.stopRequests) {
            matrixBL.stopRequests(message);
        }
    });
});

router.post('/testRequest', (req, res) => {
    matrixBL.testRequest(req.body).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.post('/sendRequests', (req, res) => {
    matrixBL.sendRequestsMatrix(req.body.matrix, req.body.projectId, req.user._id);
    res.end();
});

router.post('/stopRequests', (req, res) => {
    stopRequests(req.body.projectId, req.user._id);
    res.end();
});

function stopRequests(projectId, userId) {
    matrixBL.stopRequests(projectId);
    matrixBL.removeProjectReport(projectId, userId);
    pubsub && pubsub.publish(pubsub.channels.stopRequests, projectId);
}

events.on("stopRequests", stopRequests);

module.exports = router;