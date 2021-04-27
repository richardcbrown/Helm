const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    return {
        host: await secretManager.getSecret("REDIS_HOST"),
        port: await secretManager.getSecret("REDIS_PORT"),
    }
}

module.exports = getConfig
