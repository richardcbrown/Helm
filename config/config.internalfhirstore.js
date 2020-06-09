/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

/** @returns {FhirStoreConfig} */
function getConfig() {
    return {
        host: process.env.FHIRSTORE_INTERNAL_FHIR_URL,
    }
}

module.exports = getConfig
