/** @typedef {import("./types").FhirStoreConfig} FhirStoreConfig */

/** @returns {FhirStoreConfig} */
function getConfig() {
    return {
        host: process.env.PIX_SOS_URL,
    }
}

module.exports = getConfig
