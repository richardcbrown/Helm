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
        env: process.env.FHIRSTORE_SOS_ENV,
        agentHost: process.env.FHIRSTORE_SOS_IAM_HOST,
        agentPort: process.env.FHIRSTORE_SOS_IAM_PORT,
        passphrase: process.env.FHIRSTORE_SOS_PASSPHRASE,
        certFile: process.env.FHIRSTORE_SOS_CERTFILE,
        keyFile: process.env.FHIRSTORE_SOS_KEYFILE,
        caFile: process.env.FHIRSTORE_SOS_CA,
    }
}

module.exports = getConfig
