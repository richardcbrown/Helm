const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    const m = await secretManager.getSecret("NHS_LOGIN_INTROSPECTION_MOCK")

    const mock = m === "true" ? true : false

    return {
        host: await secretManager.getSecret("NHS_LOGIN_INTROSPECTION_URL"),
        settingsUrl: await secretManager.getSecret("NHS_LOGIN_SETTINGS_URL"),
        mock,
    }
}

module.exports = getConfig
