/** @typedef {import("./types").FhirAuthConfig} FhirAuthConfig */

/** @returns {FhirAuthConfig} */
function getConfig() {
    return {
        host: process.env.FHIRSTORE_SOS_AUTH_URL,
        clientId: process.env.FHIRSTORE_SOS_AUTH_CLIENTID,
        clientSecret: process.env.FHIRSTORE_SOS_AUTH_CLIENTSECRET,
        grantType: "client_credentials",
    }
}

module.exports = getConfig
