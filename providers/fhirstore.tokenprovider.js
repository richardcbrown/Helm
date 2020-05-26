const moment = require("moment")

/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} RequestOptions */
/** @typedef {import("./types").Token} Token */
/** @typedef {import("moleculer").LoggerInstance} Logger */

/** FhirStoreTokenProvider */
class FhirStoreTokenProvider {
    /** @param {Logger} logger */
    /** @param {import("./fhirstore.authprovider")} authProvider */
    constructor(authProvider, logger) {
        /** @private */
        this.logger = logger
        /** @private */
        this.authProvider = authProvider
        /**
         * @private
         * @type {?Token}*/
        this.token = null
        /**
         * @private
         * @type {?Date} */
        this.expires = null
    }

    /**
     * @private
     * Get access token
     * @returns {Promise<string>}
     */
    async getAccessToken() {
        try {
            if (!this.token || this.hasExpired()) {
                this.token = await this.getToken()
                this.expires = moment(moment.now()).add(this.token.expires, "s").toDate()
            }

            return this.token.access_token
        } catch (error) {
            this.logger.error(error)

            throw error
        }
    }

    /**
     * @private
     * @returns {Promise<Token>}
     */
    async getToken() {
        return await this.authProvider.authenticate()
    }

    /**
     * @private
     * @returns {boolean}
     */
    hasExpired() {
        if (!this.expires) {
            return true
        }
        // check token expiry hasnt been hit
        // with small buffer in time to prevent expiry during request
        return !moment(moment.now()).isAfter(moment(this.expires).subtract(1, "minute"))
    }

    /**
     * @public
     * @param {RequestOptions} request
     * @returns {Promise<void>}
     */
    async authorize(request) {
        const token = await this.getAccessToken()

        request.auth = { bearer: token }
    }
}

module.exports = FhirStoreTokenProvider
