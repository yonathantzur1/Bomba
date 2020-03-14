const router = require('express').Router();
const validator = require('../security/validations/validator');
const errorHandler = require('../handlers/errorHandler');

const projectsBL = require('../BL/projectsBL');

router.post('/addProject',
    validator,
    (req, res) => {
        projectsBL.addProject(req.body.name, req.user._id).then(result => {
            res.send(true);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;