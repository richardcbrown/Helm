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
            authorizationEndpoint: "/authorize",
            tokenEndpoint: "/token",
            userInfoEndpoint: "/userinfo",
            jwksEndpoint: "/.well-known/jwks.json",
        },
        clientId: await secretManager.getSecret("OIDCCLIENT_CLIENTID"),
        clientSecret: await secretManager.getSecret("OIDCCLIENT_CLIENTSECRET"),
        scope: {
            login: "openid profile profile_extended",
        },
        defaultHttpOptions: {
            rejectUnauthorized: true,
            timeout: 5000,
        },
        tokenEndpointAuthMethod: "private_key_jwt",
        tokenEndpointAuthSigningAlg: "RS512",
        privateKeyFilePath: await secretManager.getSecret("OIDCCLIENT_PRIVATE_KEY_FILE", true),
        redirectUrl: await secretManager.getSecret("OIDCCLIENT_REDIRECT_URI"),
        testState: (await secretManager.getSecret("OIDC_CLIENT_TEST_STATE")) || undefined,
        testNonce: (await secretManager.getSecret("OIDC_CLIENT_TEST_NONCE")) || undefined,
    }
}

module.exports = getConfig
