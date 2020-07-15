const router = require('express').Router();
const apiManagerBL = require('../BL/apiManagerBL');
const errorHandler = require('../handlers/errorHandler');

router.get('/getApiKey', (req, res) => {
    res.send({ "key": req.user.apiKey });
});

module.exports = router;