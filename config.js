module.exports = {
    server: {
        port: 4000,
        maxRequestSize: '10mb'
    },
    db: {
        name: "boomba",
        connectionString: process.env.DEV_CONNECTION_STRING,
        collections: {

        }
    },
}