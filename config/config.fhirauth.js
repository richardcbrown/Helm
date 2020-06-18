/** @typedef {import("./types").FhirAuthConfig} FhirAuthConfig */

/** @returns {FhirAuthConfig} */
function getConfig() {
    return {
        host: process.env.FHIRSTORE_SOS_AUTH_URL,
        clientId: process.env.FHIRSTORE_SOS_AUTH_CLIENTID,
        clientSecret: process.env.FHIRSTORE_SOS_AUTH_CLIENTSECRET,
        grantType: process.env.FHIRSTORE_SOS_AUTH_GRANTTYPE,
        scope: process.env.FHIRSTORE_SOS_AUTH_SCOPE,
        ods: process.env.FHIRSTORE_SOS_AUTH_ODS,
        rsn: process.env.FHIRSTORE_SOS_AUTH_RSN,
        aud: process.env.FHIRSTORE_SOS_AUTH_AUD,
        sub: process.env.FHIRSTORE_SOS_AUTH_SUB,
        iss: process.env.FHIRSTORE_SOS_AUTH_ISS,
        azp: process.env.FHIRSTORE_SOS_AUTH_AZP,
        rol: process.env.FHIRSTORE_SOS_AUTH_ROL,
    }
}

module.exports = getConfig
