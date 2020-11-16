const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    return {
        env: await secretManager.getSecret("YHCR_VERIFY_ENV"),
        verifyUrl: await secretManager.getSecret("YHCR_VERIFY_URL"),
        agentHost: await secretManager.getSecret("YHCR_VERIFY_HOST"),
        agentPort: await secretManager.getSecret("YHCR_VERIFY_PORT"),
        clientId: await secretManager.getSecret("SOS_DATAPROVIDER_CLIENTID"),
        clientSecret: await secretManager.getSecret("SOS_DATAPROVIDER_CLIENTSECRET"),
        passphrase: await secretManager.getSecret("SOS_DATAPROVIDER_CLIENT_PASSPHRASE"),
        certFile: await secretManager.getSecret("SOS_DATAPROVIDER_CLIENT_CERT", true),
        keyFile: await secretManager.getSecret("SOS_DATAPROVIDER_CLIENT_KEY", true),
        caFile: await secretManager.getSecret("SOS_CA_CERT", true),
    }
}

module.exports = getConfig
