const joi = require('@hapi/joi');
const REST = require('../../enums').REST
const logger = require('../../../logger');
let schemas = require('./schemas');

module.exports = (req, res, next) => {
    try {
        let fullRequestPath = req.originalUrl;
        let reqMethod = req.method;
        let data;

        if (reqMethod == REST.POST || reqMethod == REST.PUT) {
            data = req.body;
        }
        else if (reqMethod == REST.GET || reqMethod == REST.DELETE) {
            data = req.query;

            // Searching for ? of query parameters.
            let startParametersIndex = fullRequestPath.indexOf('?');

            if (startParametersIndex != -1) {
                fullRequestPath = fullRequestPath.substring(0, startParametersIndex);
            }
        }

        let schemaPath = fullRequestPath.split('/');
        schemaPath[0] = reqMethod;

        let schema = schemas[reqMethod];

        for (let i = 1; i < schemaPath.length; i++) {
            schema = schema[schemaPath[i]];

            if (schema == null) {
                throw ("No validation scheme at: " + buildSchemaPathString(schemaPath));
            }
        }

        let result = joi.object(schema).validate(data);

        if (!result) {
            throw ("Validate result is " + result);
        }
        else if (result.error) {
            throw (result.error.message);
        }
        else {
            next();
        }
    }
    catch (err) {
        logger.secure(err);
        res.sendStatus(400);
    }
};

function buildSchemaPathString(schemaPath) {
    if (schemaPath.length > 0) {
        let schema = schemaPath[0];

        for (let i = 1; i < schemaPath.length; i++) {
            schema += "->" + schemaPath[i]
        }

        return schema;
    }
    else {
        return '';
    }
}