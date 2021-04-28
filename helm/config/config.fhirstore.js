/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<FhirStoreConfig>} */
async function getConfig() {
    return {
        host: await secretManager.getSecret("FHIRSTORE_SOS_FHIR_URL"),
        env: await secretManager.getSecret("FHIRSTORE_SOS_ENV"),
        agentHost: await secretManager.getSecret("FHIRSTORE_SOS_FHIR_HOST"),
        agentPort: await secretManager.getSecret("FHIRSTORE_SOS_FHIR_PORT"),
        passphrase: await secretManager.getSecret("FHIRSTORE_SOS_PASSPHRASE"),
        certFile: await secretManager.getSecret("FHIRSTORE_SOS_CERTFILE", true),
        keyFile: await secretManager.getSecret("FHIRSTORE_SOS_KEYFILE", true),
        caFile: await secretManager.getSecret("FHIRSTORE_SOS_CA", true),
    }
}

module.exports = getConfig
