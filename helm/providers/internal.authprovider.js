/** @typedef {import("./types").Token} Token */
/** @typedef {import("../config/config.fhirauth").FhirAuthConfig} FhirAuthConfig */
/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} Options */

const getSiteAuthConfiguration = require("../config/config.siteauth")
const SiteTokenProvider = require("../providers/siteauth.tokenprovider")

class AuthProvider {
    constructor() {}

    /**
     * Sends a request to get token
     *
     * @return {Promise.<Token>}
     */
    async authenticate(user) {
        const config = await getSiteAuthConfiguration()
        const tokenProvider = new SiteTokenProvider(config)

        const token = await tokenProvider.generateSiteTokenInternal(user)

        return {
            access_token: token.token,
        }
    }
}

module.exports = AuthProvider
