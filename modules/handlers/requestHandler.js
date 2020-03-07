module.exports = {
    getIpFromRequest(request) {
        let ip = request.ip;

        return getIpFromRequestString(ip);
    },

    getUserAgentFromRequest(request) {
        return request.headers["user-agent"];
    },

    getIpFromSocket(socket) {
        let ip = socket.handshake.address;

        return getIpFromRequestString(ip);
    },

    getUserAgentFromSocket(socket) {
        return socket.request.headers["user-agent"];
    }
};

function getIpFromRequestString(ip) {
    if (ip) {
        let realIpStringPartStartIndex = ip.lastIndexOf(":") + 1;

        return ip.substring(realIpStringPartStartIndex);
    }
    else {
        return null;
    }
}