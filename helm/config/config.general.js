const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    const policyDetails = await secretManager.getSecret("POLICIES", true)

    let policies = []

    if (policyDetails) {
        policies = typeof policyDetails === "string" ? JSON.parse(policyDetails) : JSON.parse(policyDetails.toString())
    }

    return {
        questionnaireSystem: await secretManager.getSecret("TOP_THREE_THINGS_QUESTIONNAIRE_IDENTIFIER_SYSTEM"),
        questionnaireValue: await secretManager.getSecret("TOP_THREE_THINGS_QUESTIONNAIRE_IDENTIFIER_VALUE"),
        policies,
    }
}

module.exports = getConfig
