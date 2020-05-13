/** @typedef {import("./types").OidcClientConfiguration} OidcClientConfiguration */

const path = require("path")

/** @returns {OidcClientConfiguration} */
function getConfig() {
    return {
        oidcProviderHost: "https://oidc.mock.signin.nhs.uk",
        urls: {
            issuer: "https://oidc.mock.signin.nhs.uk",
            authorizationEndpoint: "/client",
            tokenEndpoint: "/token",
            userInfoEndpoint: "/userinfo",
            jwksEndpoint: "/.well-known/jwks.json",
        },
        clientId: "test",
        clientSecret: "test",
        scope: {
            login: "openid",
        },
        defaultHttpOptions: {
            rejectUnauthorized: true,
            timeout: 5000,
        },
        tokenEndpointAuthMethod: "private_key_jwt",
        tokenEndpointAuthSigningAlg: "RS512",
        privateKeyFilePath: path.join(__dirname, "../keys/nhsLoginPrivateKey.pem"),
        redirectUrl: "http://helm-local.com/auth/token",
    }
}

module.exports = getConfig
