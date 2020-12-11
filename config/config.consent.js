/** @typedef {import("./types").ConsentConfiguration} ConsentConfig */

const SecretManager = require("./config.secrets")
const { MoleculerError } = require("moleculer").Errors

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<ConsentConfig>} */
async function getConfig() {
    const policyNamesConfig = await secretManager.getSecret("CONSENT_POLICYNAMES")
    const policyFriendlyNamesConfig = await secretManager.getSecret("CONSENT_POLICYFRIENDLYNAMES")

    if (!policyNamesConfig) {
        throw new MoleculerError("Site policies not set", 500)
    }

    const policyNames = policyNamesConfig.split(",")

    if (!policyNames.length) {
        throw new MoleculerError("Site policies not set", 500)
    }

    const policyFriendlyNames = policyFriendlyNamesConfig ? policyFriendlyNamesConfig.split(",") : []

    return {
        policyFriendlyNames,
        policyNames,
    }
}

module.exports = getConfig
