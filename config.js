const isProd = (process.env.IS_PROD == 'true');
const clientPort = 4200;

module.exports = {
    server: {
        port: process.env.PORT || 8000,
        isProd,
        maxRequestSize: "10mb",
        isForceHttps: true // (for production environment)
    },
    address: {
        site: isProd ? "https://bomba-load.herokuapp.com" : `http://localhost:${clientPort}`
    },
    mailer: {
        mail: "bomba@group.com",
        apiKeyCode: process.env.BOMBA_MAIL_KEY_CODE
    },
    requests: {
        max: 1000,
        timeout: 60 * 1000 // milliseconds
    },
    redis: {
        // (redis://:<password>@<ip>:<port>)
        connectionString: process.env.BOMBA_REDIS_CONNECTION_STRING
    },
    db: {
        name: "bomba",
        connectionString: process.env.DEV_CONNECTION_STRING || process.env.BOMBA_CONNECTION_STRING,
        collections: {
            users: "Users",
            projects: "Projects",
            reports: "Reports",
            logs: "Logs"
        }
    },
    logs: {
        directoryName: "/logs",
        mainLogName: "bomba.log",
        secureLogName: "secure.log",
        maxLogSize: 5000000, // bytes
        maxLogFiles: 5
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