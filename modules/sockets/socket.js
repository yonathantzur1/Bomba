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
};

function setSocketRedisAdapter(io) {
    const redisConf = config.redis;

    if (redisConf.ip && redisConf.port && config.server.isProd) {
        let options = {
            port: redisConf.port,
            host: redisConf.ip,
            password: redisConf.password
        }

        io.adapter(redisAdapter({
            pubClient: new Redis(options),
            subClient: new Redis(options)
        }));
    }
}