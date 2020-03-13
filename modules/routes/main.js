const permissionsMiddleware = require('../middlewares/permissionsMiddleware');

module.exports = (app) => {
    // Validate user token for each api request.
    app.use('/api', Exclude([
        '/login/*',
        '/register/*',
        '/auth/isUserOnSession',
        '/auth/deleteClientAuth'
    ], permissionsMiddleware.auth));

    app.use('/api/login', require('./login'));
    app.use('/api/register', require('./register'));
    app.use('/api/matrix', require('./matrix'));

    app.use('/api/auth', require('./auth'));
}

// Exclude routes for middlewares.
function Exclude(paths, middleware) {
    return (req, res, next) => {
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let reqUrl = req.path;
            let generalPathPosition = path.indexOf('/*');
            let isExcludeMath;

            //  In case the path is general and ends with /*
            if (generalPathPosition != -1) {
                path = path.substring(0, generalPathPosition);
                isExcludeMath = (reqUrl.indexOf(path) == 0);
            }
            else {
                isExcludeMath = (path == reqUrl);
            }

            // In case the exclude path is match to req path.
            if (isExcludeMath) {
                return next();
            }
        }

        return middleware(req, res, next);
    };
}