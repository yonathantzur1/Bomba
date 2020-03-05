const router = require('express').Router();
const matrix = require('../BL/matrix');

router.post('/sendRequests', (req, res) => {
    matrix.sendRequestsMatrix(req.body.matrix);
    res.end();
});

module.exports = router;