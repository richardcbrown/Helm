/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

/** @returns {FhirStoreConfig} */
function getConfig() {
    return {
        host: process.env.FHIRSTORE_SOS_FHIR_URL,
        env: process.env.FHIRSTORE_SOS_ENV,
        agentHost: process.env.FHIRSTORE_SOS_FHIR_HOST,
        agentPort: process.env.FHIRSTORE_SOS_FHIR_PORT,
        passphrase: process.env.FHIRSTORE_SOS_PASSPHRASE,
        certFile: process.env.FHIRSTORE_SOS_CERTFILE,
        keyFile: process.env.FHIRSTORE_SOS_KEYFILE,
        caFile: process.env.FHIRSTORE_SOS_CA,
    }
}

module.exports = getConfig
