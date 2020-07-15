function getConfig() {
    return {
        host: process.env.FHIRSTORE_INTERNAL_AUTH_URL,
        clientId: process.env.FHIRSTORE_INTERNAL_AUTH_CLIENTID,
        clientSecret: process.env.FHIRSTORE_INTERNAL_AUTH_CLIENTSECRET,
        grantType: process.env.FHIRSTORE_INTERNAL_AUTH_GRANTTYPE,
        scope: process.env.FHIRSTORE_INTERNAL_AUTH_SCOPE,
    }
}

module.exports = getConfig
