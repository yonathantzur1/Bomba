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
        },
        "register": {
            "register": {
                username: joi.string().required(),
                password: joi.string().min(6).required()
            }
        },
        "projects": {
            "addProject": {
                name: joi.string().max(20).required()
            }
        }
    }
};

//#endregion

//#region put

schemas[REST.PUT] = {
    "api": {
        "admin": {
            "users": {
                "saveUserEdit": {
                    id: joi.string().required(),
                    username: joi.string().required(),
                    password: joi.string().min(6).optional()
                }
            }
        },
        "projects": {
            "editProject": {
                id: joi.string().required(),
                name: joi.string().max(20).required()
            }
        },
        "reports": {
            "setReportName": {
                reportId: joi.string().required(),
                projectId: joi.string().required(),
                name: joi.string().max(30).allow(null)
            }
        }
    }
};

//#endregion

//#region delete

schemas[REST.DELETE] = {
    "api": {
        "projects": {
            "deleteProject": {
                id: joi.string().required()
            }
        }
    }
};

//#endregion

module.exports = schemas;