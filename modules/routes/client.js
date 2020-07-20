const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');
const events = require('../events');
const API_ACTION = require('../enums').API_ACTION;

const errorHandler = require('../handlers/errorHandler');

router.get('/', (req, res) => {
    let apiKeyData = req.api;
    let action = req.query.action;
    let isActionExists = true;

    if (action == API_ACTION.START) {
        startProject(apiKeyData.project.matrix,
            apiKeyData.project._id,
            apiKeyData.user._id);
    }
    else if (action == API_ACTION.STOP) {
        stopProject(apiKeyData.project._id, apiKeyData.user._id);
    }
    else {
        isActionExists = false;
    }

    isActionExists ? res.end() : res.status(401).send("API action is not valid");
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