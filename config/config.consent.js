/** @typedef {import("./types").ConsentConfiguration} ConsentConfig */

/** @returns {ConsentConfig} */
function getConfig() {
    const policyNamesConfig = process.env.CONSENT_POLICYNAMES
    const policyFriendlyNamesConfig = process.env.CONSENT_POLICYFRIENDLYNAMES

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
