const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');
const pubsub = require("../pubsub")();

pubsub && pubsub.subscribe(pubsub.channels.stopRequests).then(result => {
    result && pubsub.onMessage((channel, message) => {
        if (channel == pubsub.channels.stopRequests) {
            matrixBL.stopRequests(message);
        }
    });
});

router.post('/sendRequests', (req, res) => {
    matrixBL.sendRequestsMatrix(req.body.matrix, req.body.projectId, req.user._id);
    res.end();
});

router.post('/stopRequests', (req, res) => {
    matrixBL.stopRequests(req.body.projectId);
    matrixBL.removeProjectReport(req.body.projectId, req.user._id);
    pubsub && pubsub.publish(pubsub.channels.stopRequests, req.body.projectId);

    res.end();
});

module.exports = router;