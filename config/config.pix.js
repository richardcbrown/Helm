/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

/** @returns {FhirStoreConfig} */
function getConfig() {
    return {
        host: process.env.PIX_SOS_URL,
        env: process.env.FHIRSTORE_SOS_ENV,
        agentHost: process.env.FHIRSTORE_SOS_FHIR_HOST,
        agentPort: process.env.FHIRSTORE_SOS_FHIR_PORT,
        passphrase: process.env.PIX_SOS_PASSPHRASE,
        certFile: process.env.PIX_SOS_CERTFILE,
        keyFile: process.env.PIX_SOS_KEYFILE,
        caFile: process.env.PIX_SOS_CA,
    }
}

module.exports = getConfig
