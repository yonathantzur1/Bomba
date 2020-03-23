const router = require('express').Router();
const usersBL = require('../../BL/admin/usersBL');
const errorHandler = require('../../handlers/errorHandler');

router.get('/getUser', (req, res) => {
    res.end();
});

module.exports = router;