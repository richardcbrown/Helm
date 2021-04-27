const moment = require("moment")

/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} RequestOptions */
/** @typedef {import("./types").Token} Token */
/** @typedef {import("moleculer").LoggerInstance} Logger */

/** TokenProvider */
class TokenProvider {
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
    async getAccessToken(nhsNumber) {
        try {
            if (!this.token || this.hasExpired() || nhsNumber) {
                this.token = await this.getToken(nhsNumber)
                this.expires = moment(moment.now()).add(this.token.expires_in, "s").toDate()
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
    async getToken(nhsNumber) {
        return await this.authProvider.authenticate(nhsNumber)
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
        const now = moment(moment.now())
        const expires = moment(this.expires).subtract(1, "minute")

        return now.isAfter(expires)
    }

    /**
     * @public
     * @param {RequestOptions} request
     * @returns {Promise<void>}
     */
    async authorize(request, nhsNumber) {
        const token = await this.getAccessToken(nhsNumber)

        request.auth = { bearer: token }
    }
}

module.exports = TokenProvider
