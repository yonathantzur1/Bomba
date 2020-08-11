const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');
const events = require('../events');
const API_ACTION = require('../enums').API_ACTION;

router.get('/', (req, res) => {
    const apiKeyData = req.api;
    const action_type = req.query.action;
    let isActionExists = true;

    switch (action_type) {
        case API_ACTION.START.toString():
            startProject(apiKeyData.project.matrix,
                apiKeyData.project._id,
                apiKeyData.user._id);
            break;
        case API_ACTION.STOP.toString():
            stopProject(apiKeyData.project._id, apiKeyData.user._id);
            break;
        default:
            isActionExists = false;
            break;
    }

    isActionExists ? res.send("ok") : res.status(401).send("API action is not valid");
});

function startProject(matrix, projectId, userId) {
    stopProject(projectId, userId);
    events.emit("socket.selfSync", userId, "syncSendRequests", { projectId })
    matrixBL.sendRequestsMatrix(matrix, projectId, userId);
}

function stopProject(projectId, userId) {
    events.emit("socket.selfSync", userId, "syncCloseReport", { projectId })
    events.emit("stopRequests", projectId, userId);
}

module.exports = router;