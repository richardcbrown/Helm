/** @typedef {import("./types").SiteAuthConfiguration} SiteAuthConfiguration */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<SiteAuthConfiguration>} */
async function getConfig() {
    const jwtSigningSecret = await secretManager.getSecret("SITEAUTH_JWTSIGNINGSECRET")
    const jwtExpiryString = await secretManager.getSecret("SITEAUTH_JWTEXPIRY")
    const jwtSigningAlgorithm = await secretManager.getSecret("SITEAUTH_JWTSIGNINGALGORITHM")
    const issuer = await secretManager.getSecret("SITEAUTH_ISSUER")
    const audience = await secretManager.getSecret("SITEAUTH_AUDIENCE")

    if (!jwtSigningSecret) {
        throw Error("JWT Signing Secret not set")
    }

    if (!jwtExpiryString) {
        throw Error("JWT Expiry not set")
    }

    if (!jwtSigningAlgorithm) {
        throw Error("JWT Signing Algorithm not set")
    }

    if (!issuer) {
        throw Error("JWT Issuer not set")
    }

    if (!audience) {
        throw Error("JWT Audience not set")
    }

    const jwtExpiry = Number(jwtExpiryString)

    if (isNaN(jwtExpiry)) {
        throw Error("JWT Expiry invalid")
    }

    return {
        jwtSigningSecret,
        jwtExpiry,
        jwtSigningAlgorithm,
        issuer,
        audience,
    }
}

module.exports = getConfig
