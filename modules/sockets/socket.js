const Redis = require('ioredis');
const redisAdapter = require('socket.io-redis');

const config = require('../../config');
const tokenHandler = require('../handlers/tokenHandler');
const events = require('../events');

module.exports = (io) => {
    setSocketRedisAdapter(io);

    io.on('connection', (socket) => {
        socket.on('login', () => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            if (token) {
                let user = token.user;
                let userId = user._id;

                // Join socket to socket room.
                socket.join(userId);
            }
        });

        socket.on('selfSync', (eventName, data) => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            if (token) {
                io.to(token.user._id).emit(eventName, data);
            }
        });

        socket.on('LogoutUserSessionServer', (msg, userId) => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            // Logout the given user in case the sender is admin, or in case the logout is self.
            if (token && (token.user.isAdmin || !userId)) {
                io.to(userId || token.user._id).emit('LogoutUserSessionClient', msg);
            }
        });
    });

    events.on('socket.selfSync', (userId, eventName, data) => {
        io.to(userId).emit(eventName, data);
    });

    events.on('socket.requestStart', (userId, data) => {
        io.to(userId).emit('requestStart', data);
    });

    events.on('socket.requestStatus', (userId, data) => {
        io.to(userId).emit('requestStatus', data);
    });

    events.on('socket.finishReport', (userId, projectId) => {
        io.to(userId).emit('finishReport', projectId);
    });

    events.on('socket.testResult', (userId, response, requestId) => {
        io.to(userId).emit('testResult', response, requestId);
    });
};

function setSocketRedisAdapter(io) {
    const redisConnectionString = config.redis.connectionString;

    if (config.server.isProd && redisConnectionString) {
        io.adapter(redisAdapter({
            pubClient: new Redis(redisConnectionString),
            subClient: new Redis(redisConnectionString)
        }));
    }
}