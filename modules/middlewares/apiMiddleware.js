const apiManagerBL = require('../BL/apiManagerBL');

module.exports = {
    async validateApiKey(req, res, next) {
        let apiKey = req.query.key;
        let projectName = req.query.project;
        let envName = req.query.env;

        let apiKeyData = await apiManagerBL.getApiKeyData(apiKey, projectName, envName);

        if (apiKeyData) {
            req.api = apiKeyData;
            next();
        }
        else {
            res.status(401).send("There is an invalid parameter");
        }
    }
};