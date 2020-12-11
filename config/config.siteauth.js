/** @typedef {import("./types").SiteAuthConfiguration} SiteAuthConfiguration */

const SecretManager = require("./config.secrets")
const { MoleculerError } = require("moleculer").Errors

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<SiteAuthConfiguration>} */
async function getConfig() {
    const jwtSigningSecret = await secretManager.getSecret("SITEAUTH_JWTSIGNINGSECRET")
    const jwtExpiryString = await secretManager.getSecret("SITEAUTH_JWTEXPIRY")
    const jwtSigningAlgorithm = await secretManager.getSecret("SITEAUTH_JWTSIGNINGALGORITHM")
    const issuer = await secretManager.getSecret("SITEAUTH_ISSUER")
    const audience = await secretManager.getSecret("SITEAUTH_AUDIENCE")

    if (!jwtSigningSecret) {
        throw new MoleculerError("JWT Signing Secret not set", 500)
    }

    if (!jwtExpiryString) {
        throw new MoleculerError("JWT Expiry not set", 500)
    }

    if (!jwtSigningAlgorithm) {
        throw new MoleculerError("JWT Signing Algorithm not set", 500)
    }

    if (!issuer) {
        throw new MoleculerError("JWT Issuer not set", 500)
    }

    if (!audience) {
        throw new MoleculerError("JWT Audience not set", 500)
    }

    const jwtExpiry = Number(jwtExpiryString)

    if (isNaN(jwtExpiry)) {
        throw new MoleculerError("JWT Expiry invalid", 500)
    }

    return {
        jwtSigningSecret,
        jwtExpiry,
        jwtSigningAlgorithm,
        issuer,
        audience,
        nhsNumberMap: {
            "9990134243": "9449306265",
            "9686367403": "9449306265",
            "9686368663": "9449306265",
            "9686367608": "9449306265",
            "9686368353": "9449306265",
            "9686368469": "9449306265",
            "9686368728": "9449306265",
            "9686368620": "9449306265",
            "9686368485": "9449306265",
            "9686368477": "9449306265",
            "9686368450": "9449306265",
        },
    }
}

module.exports = getConfig
