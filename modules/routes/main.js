module.exports = (app) => {
    app.use('/api/matrix', require('./matrix'));
}