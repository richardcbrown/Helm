/** @typedef {import("./types").FhirAuthConfig} FhirAuthConfig */

/** @returns {FhirAuthConfig} */
function getConfig() {
    return {
        host: process.env.PIX_SOS_AUTH_URL,
        clientId: process.env.PIX_SOS_AUTH_CLIENTID,
        clientSecret: process.env.PIX_SOS_AUTH_CLIENTSECRET,
        grantType: process.env.PIX_SOS_AUTH_GRANTTYPE,
        scope: process.env.PIX_SOS_AUTH_SCOPE,
        ods: process.env.PIX_SOS_AUTH_ODS,
        rsn: process.env.PIX_SOS_AUTH_RSN,
        aud: process.env.PIX_SOS_AUTH_AUD,
        sub: process.env.PIX_SOS_AUTH_SUB,
        iss: process.env.PIX_SOS_AUTH_ISS,
        azp: process.env.PIX_SOS_AUTH_AZP,
        rol: process.env.PIX_SOS_AUTH_ROL,
        env: process.env.PIX_SOS_ENV,
        agentHost: process.env.PIX_SOS_IAM_HOST,
        agentPort: process.env.PIX_SOS_IAM_PORT,
        passphrase: process.env.PIX_SOS_PASSPHRASE,
        certFile: process.env.PIX_SOS_CERTFILE,
        keyFile: process.env.PIX_SOS_KEYFILE,
        caFile: process.env.PIX_SOS_CA,
    }
}

module.exports = getConfig
