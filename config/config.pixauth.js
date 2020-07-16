/** @typedef {import("./types").FhirAuthConfig} FhirAuthConfig */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<FhirAuthConfig>} */
async function getConfig() {
    return {
        host: await secretManager.getSecret("PIX_SOS_AUTH_URL"),
        clientId: await secretManager.getSecret("PIX_SOS_AUTH_CLIENTID"),
        clientSecret: await secretManager.getSecret("PIX_SOS_AUTH_CLIENTSECRET"),
        grantType: await secretManager.getSecret("PIX_SOS_AUTH_GRANTTYPE"),
        scope: await secretManager.getSecret("PIX_SOS_AUTH_SCOPE"),
        ods: await secretManager.getSecret("PIX_SOS_AUTH_ODS"),
        rsn: await secretManager.getSecret("PIX_SOS_AUTH_RSN"),
        aud: await secretManager.getSecret("PIX_SOS_AUTH_AUD"),
        sub: await secretManager.getSecret("PIX_SOS_AUTH_SUB"),
        iss: await secretManager.getSecret("PIX_SOS_AUTH_ISS"),
        azp: await secretManager.getSecret("PIX_SOS_AUTH_AZP"),
        rol: await secretManager.getSecret("PIX_SOS_AUTH_ROL"),
        env: await secretManager.getSecret("PIX_SOS_ENV"),
        agentHost: await secretManager.getSecret("PIX_SOS_IAM_HOST"),
        agentPort: await secretManager.getSecret("PIX_SOS_IAM_PORT"),
        passphrase: await secretManager.getSecret("PIX_SOS_PASSPHRASE"),
        certFile: await secretManager.getSecret("PIX_SOS_CERTFILE", true),
        keyFile: await secretManager.getSecret("PIX_SOS_KEYFILE", true),
        caFile: await secretManager.getSecret("PIX_SOS_CA", true),
    }
}

module.exports = getConfig
