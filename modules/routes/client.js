const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');
const logsBL = require('../BL/logsBL');
const events = require('../events');
const API_ACTION = require('../enums').API_ACTION;

router.get('/', (req, res) => {
    const apiKeyData = req.api;
    const action_type = req.query.action;
    let isActionExists = true;

    if (!apiKeyData.project.matrix || isMatrixEmpty(apiKeyData.project.matrix)) {
        return res.status(500).send("API for empty project is not valid");
    }

    switch (action_type) {
        case API_ACTION.START.toString():
            startProject(apiKeyData.project.matrix,
                apiKeyData.project._id,
                apiKeyData.project.timeout,
                apiKeyData.project.env,
                apiKeyData.user._id);
            logsBL.projectRun(apiKeyData.user.username, req);
            break;
        case API_ACTION.STOP.toString():
            stopProject(apiKeyData.project._id, apiKeyData.user._id);
            break;
        default:
            isActionExists = false;
            break;
    }

    isActionExists ? res.send("ok") : res.status(500).send("API action is not valid");
});

function isMatrixEmpty(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].isEmpty == false) {
                return false;
            }
        }
    }

    return true;
}

function startProject(matrix, projectId, timeout, env, userId) {
    stopProject(projectId, userId);
    events.emit("socket.selfSync", userId, "syncSendRequests", { projectId })
    matrixBL.sendRequestsMatrix(matrix, projectId, timeout, env, userId);
}

function stopProject(projectId, userId) {
    events.emit("socket.selfSync", userId, "syncCloseReport", { projectId })
    events.emit("stopRequests", projectId, userId);
}

module.exports = router;
