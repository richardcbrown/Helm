/** @typedef {import("./types").Token} Token */
/** @typedef {import("../config/config.fhirauth").FhirAuthConfig} FhirAuthConfig */
/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} Options */

const request = require("request-promise-native")
const uuid = require("uuid")

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
                    assertion: this.getAssertion(),
                },
                headers: {
                    authorization: `Basic ${Buffer.from(
                        configuration.clientId + ":" + configuration.clientSecret
                    ).toString("base64")}`,
                },
                json: true,
                rejectUnauthorized: false,
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

    /**
     * @private
     * @returns {string}
     */
    getAssertion() {
        const { scope, ods, aud, rol, rsn, sub, iss, azp } = this.configuration

        const iat = new Date().getTime() / 1000
        const exp = iat + 3600

        const jwtAssertion = {
            iss,
            scope,
            aud,
            ods,
            usr: { rol, org: ods },
            sub,
            rsn,
            exp,
            iat,
            azp,
            jti: uuid.v4(),
        }

        return JSON.stringify(jwtAssertion)
    }
}

module.exports = AuthProvider
