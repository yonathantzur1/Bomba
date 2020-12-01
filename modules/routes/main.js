const permissionsMiddleware = require('../middlewares/permissionsMiddleware');
const apiMiddleware = require('../middlewares/apiMiddleware');

module.exports = (app) => {
    // Validate user token for each api request.
    app.use('/api', Exclude([
        '/login/*',
        '/register/*',
        '/forgotPassword/*',
        '/client/*',
        '/auth/isUserOnSession',
        '/auth/deleteClientAuth'
    ], permissionsMiddleware.auth));

    app.use('/api/admin', permissionsMiddleware.admin);

    app.use('/api/login', require('./login'));
    app.use('/api/register', require('./register'));
    app.use('/api/forgotPassword', require('./forgotPassword'));
    app.use('/api/projects', require('./projects'));
    app.use('/api/matrix', require('./matrix'));
    app.use('/api/environments', require('./environments'));
    app.use('/api/board', require('./board'));
    app.use('/api/reports', require('./reports'));
    app.use('/api/apiManager', require('./apiManager'));

    app.use('/api/admin/users', require('./admin/users'));
    app.use('/api/admin/statistics', require('./admin/statistics'));
    app.use('/api/admin/tracker', require('./admin/tracker'));

    app.use('/api/auth', require('./auth'));

    // Clients API requests
    app.use('/api/client', apiMiddleware.validateApiKey, require('./client'));
}

// Exclude routes for middlewares.
function Exclude(paths, middleware) {
    return (req, res, next) => {
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            const reqUrl = req.path;
            const generalPathPosition = path.indexOf('/*');
            let isExcludeMatch;

            //  In case the path is general and ends with /*
            if (generalPathPosition != -1) {
                path = path.substring(0, generalPathPosition);
                isExcludeMatch = (reqUrl.indexOf(path) == 0);
            }
            else {
                isExcludeMatch = (path == reqUrl);
            }

            // In case the exclude path is match to req path.
            if (isExcludeMatch) {
                return next();
            }
        }

        return middleware(req, res, next);
    };
}