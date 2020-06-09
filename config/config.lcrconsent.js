/** @typedef {import("./types").LcrConsentAuthConfig} LcrConsentAuthConfig */
/** @typedef {import("./types").LcrConsentConfig} LcrConsentConfig */

/** @returns {LcrConsentAuthConfig} */
function getAuthConfig() {
    return {
        host: process.env.LCR_CONSENT_AUTH_URL,
        clientId: process.env.LCR_CONSENT_AUTH_CLIENTID,
        clientSecret: process.env.LCR_CONSENT_AUTH_CLIENTSECRET,
        grantType: process.env.LCR_CONSENT_AUTH_GRANTTYPE,
        scope: process.env.LCR_CONSENT_AUTH_SCOPE,
    }
}

/** @returns {LcrConsentConfig}  */
function getConfig() {
    return {
        host: process.env.LCR_CONSENT_URL,
        method: process.env.LCR_CONSENT_METHOD,
    }
}

module.exports = { getAuthConfig, getConfig }
