/** @typedef {import("./types").SiteAuthConfiguration} SiteAuthConfiguration */

const SecretManager = require("./config.secrets")
const { MoleculerError } = require("moleculer").Errors

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<SiteAuthConfiguration>} */
async function getConfig() {
    const publicKey = await secretManager.getSecret("SITEAUTH_PUBLICKEY", true)
    const privateKey = await secretManager.getSecret("SITEAUTH_PRIVATEKEY", true)
    const jwtExpiryString = await secretManager.getSecret("SITEAUTH_JWTEXPIRY")
    const jwtSigningAlgorithm = await secretManager.getSecret("SITEAUTH_JWTSIGNINGALGORITHM")
    const issuer = await secretManager.getSecret("SITEAUTH_ISSUER")
    const audience = await secretManager.getSecret("SITEAUTH_AUDIENCE")

    const nhsNumberMapDetails = await secretManager.getSecret("NHS_NUMBER_MAP", true)

    let nhsNumberMap = {}

    if (nhsNumberMapDetails) {
        nhsNumberMap =
            typeof nhsNumberMapDetails === "string"
                ? JSON.parse(nhsNumberMapDetails)
                : JSON.parse(nhsNumberMapDetails.toString())
    }

    if (!privateKey) {
        throw new MoleculerError("JWT Signing Secret not set", 500)
    }

    if (!publicKey) {
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
        publicKey,
        privateKey,
        jwtExpiry,
        jwtSigningAlgorithm,
        issuer,
        audience,
        nhsNumberMap,
    }
}

module.exports = getConfig
