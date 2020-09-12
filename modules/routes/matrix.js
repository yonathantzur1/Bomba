const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');
const logsBL = require('../BL/logsBL');
const events = require('../events');
const validator = require('../security/validations/validator');
const pubsub = require("../pubsub")();

pubsub && pubsub.subscribe(pubsub.channels.stopRequests).then(result => {
    result && pubsub.onMessage((channel, message) => {
        if (channel == pubsub.channels.stopRequests) {
            matrixBL.stopRequests(message);
        }
    });
});

router.post('/testRequest', validator, (req, res) => {
    matrixBL.testRequest(req.body.request,
        req.body.requestTimeout,
        req.body.env,
        req.user._id);
    res.send(true);
});

router.post('/sendRequests', validator, (req, res) => {
    matrixBL.sendRequestsMatrix(req.body.matrix,
        req.body.projectId,
        req.body.requestTimeout,
        req.body.env,
        req.user._id);
    logsBL.projectRun(req.user.username, req);

    res.send(true);
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