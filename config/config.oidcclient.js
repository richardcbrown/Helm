/** @typedef {import("./types").OidcClientConfiguration} OidcClientConfiguration */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

const path = require("path")

/** @returns {Promise<OidcClientConfiguration>} */
async function getConfig() {
    return {
        oidcProviderHost: await secretManager.getSecret("OIDCCLIENT_ISSUER"),
        urls: {
            issuer: await secretManager.getSecret("OIDCCLIENT_ISSUER"),
            authorizationEndpoint: "/client",
            tokenEndpoint: "/token",
            userInfoEndpoint: "/userinfo",
            jwksEndpoint: "/.well-known/jwks.json",
        },
        clientId: await secretManager.getSecret("OIDCCLIENT_CLIENTID"),
        clientSecret: await secretManager.getSecret("OIDCCLIENT_CLIENTSECRET"),
        scope: {
            login: "openid",
        },
        defaultHttpOptions: {
            rejectUnauthorized: true,
            timeout: 5000,
        },
        tokenEndpointAuthMethod: "private_key_jwt",
        tokenEndpointAuthSigningAlg: "RS512",
        privateKeyFilePath: await secretManager.getSecret("OIDCCLIENT_PRIVATE_KEY_FILE", true),
        redirectUrl: await secretManager.getSecret("OIDCCLIENT_REDIRECT_URI"),
    }
}

module.exports = getConfig
