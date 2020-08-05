const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    let auth = await secretManager.getSecret("FHIRSTORE_INTERNAL_AUTHENTICATE")

    return {
        host: await secretManager.getSecret("FHIRSTORE_INTERNAL_AUTH_URL"),
        clientId: await secretManager.getSecret("FHIRSTORE_INTERNAL_AUTH_CLIENTID"),
        clientSecret: await secretManager.getSecret("FHIRSTORE_INTERNAL_AUTH_CLIENTSECRET"),
        grantType: await secretManager.getSecret("FHIRSTORE_INTERNAL_AUTH_GRANTTYPE"),
        scope: await secretManager.getSecret("FHIRSTORE_INTERNAL_AUTH_SCOPE"),
        authenticate: auth === "false" ? false : true,
    }
}

module.exports = getConfig
