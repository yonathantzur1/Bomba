const apiManagerBL = require('../BL/apiManagerBL');

module.exports = {
    async validateApiKey(req, res, next) {
        let apiKey = req.query.key;
        let projectName = req.query.project;

        let apiKeyData = await apiManagerBL.getApiKeyData(apiKey, projectName);

        if (apiKeyData) {
            req.api = apiKeyData;
            next();
        }
        else {
            res.status(401).send("API key or project name is not valid");
        }
    }
};