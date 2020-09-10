exports.REST = Object.freeze({
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
});

exports.API_ACTION = Object.freeze({
    START: 0,
    STOP: 1
});

exports.LOG_TYPE = Object.freeze({
    LOGIN: 0,
    LOGIN_FAIL: 1,
    REGISTER: 2,
    PROJECT_RUN: 3
});

exports.STATISTICS_RANGE = Object.freeze({
    YEARLY: 0,
    WEEKLY: 1
});