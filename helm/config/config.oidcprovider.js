/** @typedef {import("./types").OidcProviderConfiguration} OidcProviderConfiguration */

const path = require("path")

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<OidcProviderConfiguration>} */
async function getConfig() {
    const allowedClients = await secretManager.getSecret("OIDCPROVIDER_INTROSPECTION_ALLOWED_CLIENTIDS")

    return {
        issuer: await secretManager.getSecret("OIDCPROVIDER_ISSUER"),
        privateKeyFilePath: await secretManager.getSecret("OIDCPROVIDER_PRIVATE_KEY_FILE", true),
        verifyUrl: await secretManager.getSecret("OIDCPROVIDER_VERIFY_URL"),
        verifyClientId: await secretManager.getSecret("OIDCPROVIDER_VERIFY_CLIENTID"),
        verifyClientSecret: await secretManager.getSecret("OIDCPROVIDER_VERIFY_CLIENTSECRET"),
        introspectionAllowedClients: (allowedClients && allowedClients.split(" ")) || [],
    }
}

module.exports = getConfig
