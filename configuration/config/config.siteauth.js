/** @typedef {import("./types").SiteAuthConfiguration} SiteAuthConfiguration */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<SiteAuthConfiguration>} */
async function getConfig() {
    const publicKey = await secretManager.getSecret("SITEAUTH_PUBLICKEY", true)

    if (!publicKey) {
        throw new Error("JWT Signing Secret not set")
    }

    return {
        publicKey,
    }
}

module.exports = getConfig
