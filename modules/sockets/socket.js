const tokenHandler = require('../handlers/tokenHandler');
const logger = require('../../logger');

let connectedUsers = {};

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('login', () => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            if (token) {
                let user = token.user;
                let userId = user._id;
                let connectUser = connectedUsers[userId];

                // In case the user is already login.
                if (connectUser) {
                    connectUser.connections++;
                }
                else {
                    user.connections = 1;
                    connectedUsers[userId] = user;
                }

                // Join socket to socket room.
                socket.join(userId);
            }
        });

        socket.on('disconnect', () => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            if (token) {
                let userId = token.user._id;
                let user = connectedUsers[userId];

                if (user) {
                    // In case the user was connected only once.
                    if (user.connections == 1) {
                        delete connectedUsers[userId];
                    }
                    else {
                        user.connections--;
                    }
                }
            }
        });

        socket.on('error', (err) => {
            logger.error(err);
        });
    });

    return connectedUsers;
};