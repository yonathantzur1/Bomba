const joi = require('@hapi/joi');
const REST = require('../../enums').REST

let schemas = {};

//#region get

schemas[REST.GET] = {
    "api": {
        "register": {
            "getVerificationUserData": {
                userUid: joi.string().length(24).required()
            }
        },
        "forgotPassword": {
            "isResetCodeValid": {
                resetCode: joi.string().length(24).required()
            }
        }
    }
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
                username: joi.string().regex(/^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/).required(),
                email: joi.string().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).required(),
                password: joi.string().min(6).required()
            }
        },
        "projects": {
            "addProject": {
                name: joi.string().max(20).required()
            }
        },
        "matrix": {
            "testRequest": {
                request: joi.required(),
                requestTimeout: joi.number().min(1).max(120000).required(),
                envValues: joi.any()
            },
            "sendRequests": {
                matrix: joi.required(),
                projectId: joi.string().required(),
                requestTimeout: joi.number().min(1).max(120000).required(),
                env: joi.any()
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
                    username: joi.string().regex(/^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/).required(),
                    email: joi.string().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).required(),
                    password: joi.string().min(6).optional().allow('')
                }
            }
        },
        "register": {
            "verifyUser": {
                verificationCode: joi.string().length(24).required()
            },
            "resendVerification": {
                userUid: joi.string().length(24).required()
            }
        },
        "forgotPassword": {
            "setPassword": {
                resetCode: joi.string().length(24).required(),
                password: joi.string().min(6).required()
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