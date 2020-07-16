/** @typedef {import("./types").ConsentConfiguration} ConsentConfig */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<ConsentConfig>} */
async function getConfig() {
    const policyNamesConfig = await secretManager.getSecret("CONSENT_POLICYNAMES")
    const policyFriendlyNamesConfig = await secretManager.getSecret("CONSENT_POLICYFRIENDLYNAMES")

    if (!policyNamesConfig) {
        throw Error("Site policies not set")
    }

    const policyNames = policyNamesConfig.split(",")

    if (!policyNames.length) {
        throw Error("Site policies not set")
    }

    const policyFriendlyNames = policyFriendlyNamesConfig ? policyFriendlyNamesConfig.split(",") : []

    return {
        policyFriendlyNames,
        policyNames,
    }
}

module.exports = getConfig
