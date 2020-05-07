/** @typedef {import("./types").ConsentConfiguration} ConsentConfig */

/** @returns {ConsentConfig} */
function getConfig() {
    return {
        policyFriendlyNames: ["Helm Terms and Conditions", "Helm Privacy Notice"],
        policyNames: ["v1h Test Helm Terms", "v1h Helm Privacy"],
    }
}

module.exports = getConfig
