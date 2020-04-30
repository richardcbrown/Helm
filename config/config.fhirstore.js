/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

/** @returns {FhirStoreConfig} */
function getConfig() {
    return {
        host: process.env.FHIRSTORE_SOS_FHIR_URL,
    }
}

module.exports = getConfig
