/** @typedef {import("./types").OidcClientConfiguration} OidcClientConfiguration */

const path = require("path")

/** @returns {OidcClientConfiguration} */
function getConfig() {
    return {
        oidcProviderHost: process.env.OIDCCLIENT_ISSUER,
        urls: {
            issuer: process.env.OIDCCLIENT_ISSUER,
            authorizationEndpoint: "/client",
            tokenEndpoint: "/token",
            userInfoEndpoint: "/userinfo",
            jwksEndpoint: "/.well-known/jwks.json",
        },
        clientId: process.env.OIDCCLIENT_CLIENTID,
        clientSecret: process.env.OIDCCLIENT_CLIENTSECRET,
        scope: {
            login: "openid",
        },
        defaultHttpOptions: {
            rejectUnauthorized: true,
            timeout: 5000,
        },
        tokenEndpointAuthMethod: "private_key_jwt",
        tokenEndpointAuthSigningAlg: "RS512",
        privateKeyFilePath: path.join(__dirname, process.env.OIDCCLIENT_PRIVATE_KEY_FILE),
        redirectUrl: process.env.OIDCCLIENT_REDIRECT_URI,
    }
}

module.exports = getConfig
