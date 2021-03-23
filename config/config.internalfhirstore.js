/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<FhirStoreConfig>} */
async function getConfig() {
    return {
        host: await secretManager.getSecret("FHIRSTORE_INTERNAL_FHIR_URL"),
        yhcrHost: await secretManager.getSecret("FHIRSTORE_INTERNAL_YHCR_FHIR_URL"),
    }
}

module.exports = getConfig
