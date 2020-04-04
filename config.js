module.exports = {
    server: {
        port: process.env.PORT || 8000,
        isProd: (process.env.IS_PROD == 'true'),
        maxRequestSize: "10mb"
    },
    requests: {
        max: 100
    },
    db: {
        name: "bomba",
        connectionString: process.env.DEV_CONNECTION_STRING || process.env.BOMBA_CONNECTION_STRING,
        collections: {
            users: "Users",
            projects: "Projects",
            reports: "Reports"
        }
    },
    logs: {
        directoryName: "/logs",
        mainLogName: "bomba.log",
        secureLogName: "bomba.log",
        maxLogSize: 5000000, // bytes
        maxLogFiles: 3
    },
    security: {
        jwt: {
            secret: process.env.BOMBA_JWT_SECRET,
            options: { expiresIn: "90d" } // 90 days
        },
        encrypt: {
            algorithm: "aes192",
            secret: process.env.BOMBA_ENCRYPT_SECRET,
            salt: process.env.BOMBA_ENCRYPT_SALT
        },
        token: {
            cookieName: "tk",
            uidCookieName: "uid",
            socketCookieName: "io",
            maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
        },
        limitter: {
            freeRetries: 5,
            waitTime: 1 * 60 * 1000, // 1 minutes
        },
        password: {
            saltSize: 8
        }
    }
}