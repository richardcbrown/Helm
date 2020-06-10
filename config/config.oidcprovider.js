/** @typedef {import("./types").OidcProviderConfiguration} OidcProviderConfiguration */

const path = require("path")

/** @returns {OidcProviderConfiguration} */
function getConfig() {
    return {
        issuer: process.env.OIDCPROVIDER_ISSUER,
        privateKeyFilePath: path.join(__dirname, process.env.OIDCPROVIDER_PRIVATE_KEY_FILE),
        verifyUrl: process.env.OIDCPROVIDER_VERIFY_URL,
        verifyClientId: process.env.OIDCPROVIDER_VERIFY_CLIENTID,
        verifyClientSecret: process.env.OIDCPROVIDER_VERIFY_CLIENTSECRET,
    }
}

module.exports = getConfig
