const router = require('express').Router();
const sender = require('../BL/sender');

router.post('/sendRequests', (req, res) => {
    sender.sendRequestsMatrix(req.body.requestsMatrix);
    res.end();
});

module.exports = router;