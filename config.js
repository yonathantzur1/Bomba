module.exports = {
    server: {
        port: 8000,
        maxRequestSize: '10mb'
    },
    db: {
        name: "bomba",
        connectionString: process.env.DEV_CONNECTION_STRING,
        collections: {

        }
    },
}