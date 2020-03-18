const router = require('express').Router();
const matrixBL = require('../BL/matrixBL');

router.post('/sendRequests', (req, res) => {
    matrixBL.sendRequestsMatrix(req.body.matrix, req.user._id);
    res.end();
});

module.exports = router;