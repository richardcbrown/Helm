const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    const m = await secretManager.getSecret("NHS_LOGIN_INTROSPECTION_MOCK")

    const mock = (m && Boolean(m)) || false

    return {
        host: await secretManager.getSecret("NHS_LOGIN_INTROSPECTION_URL"),
        mock,
        nhsNumberMap: {
            "9999999801": "9449303983",
        },
    }
}

module.exports = getConfig
