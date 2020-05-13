/** @typedef {import("./types").SiteAuthConfiguration} SiteAuthConfiguration */

/** @returns {SiteAuthConfiguration} */
function getConfig() {
    const jwtSigningSecret = process.env.SITEAUTH_JWTSIGNINGSECRET
    const jwtExpiryString = process.env.SITEAUTH_JWTEXPIRY
    const jwtSigningAlgorithm = process.env.SITEAUTH_JWTSIGNINGALGORITHM
    const issuer = process.env.SITEAUTH_ISSUER
    const audience = process.env.SITEAUTH_AUDIENCE

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
