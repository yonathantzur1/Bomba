const router = require('express').Router();
const errorHandler = require('../handlers/errorHandler');

router.get('/getApiKey', (req, res) => {
    res.end()
});

module.exports = router;