/** @typedef {import("./types").Token} Token */
/** @typedef {import("../config/config.fhirauth").FhirAuthConfig} FhirAuthConfig */
/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} Options */

const request = require("request-promise-native")

class AuthProvider {
    /** @param {Logger} logger */
    /** @param {FhirAuthConfig} configuration */
    constructor(configuration, logger) {
        /** @private */
        this.configuration = configuration
        /** @private */
        this.logger = logger
    }

    /**
     * Sends a request to get token
     *
     * @return {Promise.<Token>}
     */
    async authenticate() {
        try {
            const { configuration } = this

            /** @type {Options} */
            let options = {
                url: configuration.host,
                method: "POST",
                form: {
                    grant_type: configuration.grantType,
                },
                headers: {
                    authorization: `Basic ${Buffer.from(
                        configuration.clientId + ":" + configuration.clientSecret
                    ).toString("base64")}`,
                },
                json: true,
                rejectUnauthorized: false,
            }

            if (configuration.scope) {
                options.form.scope = configuration.scope
            }

            /** @todo proxy config */
            // if (this.hostConfig.proxy) {
            //     options.proxy = this.hostConfig.proxy
            // }

            return await request(options)
        } catch (error) {
            this.logger.error(error)

            throw error
        }
    }
}

module.exports = AuthProvider
