const joi = require('@hapi/joi');
const REST = require('../../enums').REST

let schemas = {};

//#region get

schemas[REST.GET] = {

};

//#endregion

//#region post

schemas[REST.POST] = {
    "api": {
        "login": {
            "userLogin": {
                username: joi.string().required(),
                password: joi.string().required()
            }
        }
    }
};

//#endregion

//#region put

schemas[REST.PUT] = {

};

//#endregion

//#region delete

schemas[REST.DELETE] = {

};

//#endregion

module.exports = schemas;