const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    return {
        host: await secretManager.getSecret("YHCR_VERIFY_URL"),
        clientId: await secretManager.getSecret("YHCR_VERIFY_CLIENTID"),
        clientSecret: await secretManager.getSecret("YHCR_VERIFY_CLIENTSECRET"),
    }
}

module.exports = getConfig
