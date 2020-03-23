const permissionsMiddleware = require('../middlewares/permissionsMiddleware');

module.exports = (app, connectedUsers) => {
    // Validate user token for each api request.
    app.use('/api', Exclude([
        '/login/*',
        '/register/*',
        '/auth/isUserOnSession',
        '/auth/deleteClientAuth'
    ], permissionsMiddleware.auth));

    app.use('/api/admin', permissionsMiddleware.admin);

    app.use('/api/login', require('./login'));
    app.use('/api/register', require('./register'));
    app.use('/api/projects', require('./projects'));
    app.use('/api/matrix', require('./matrix'));
    app.use('/api/board', require('./board'));
    app.use('/api/results', require('./results'));

    app.use('/api/admin/users', require('./admin/users'));
    app.use('/api/admin/statistics', require('./admin/statistics'));

    app.use('/api/auth', (req, res, next) => {
        req.connectedUsers = connectedUsers;
        next();
    }, require('./auth'));
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