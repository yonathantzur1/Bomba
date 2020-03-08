module.exports = (app) => {
    app.use('/api/login', require('./login'));
    app.use('/api/register', require('./register'));
    app.use('/api/matrix', require('./matrix'));

    app.use('/api/auth', require('./auth'));
}