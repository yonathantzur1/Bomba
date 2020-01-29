module.exports = (app) => {
    app.use('/api/sender', require('./sender'));
}