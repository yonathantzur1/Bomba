module.exports = {
    generateCode(numOfChars, isOnlyNumbers) {
        let code = '';
        let possible = isOnlyNumbers ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < numOfChars; i++) {
            code += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return code;
    },

    generateId() {
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }
};