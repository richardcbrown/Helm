/** @typedef {import("./types").Token} Token */
/** @typedef {import("../config/config.fhirauth").FhirAuthConfig} FhirAuthConfig */
/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} Options */

const request = require("request-promise-native")
const uuid = require("uuid")
const https = require("https")
const jwt = require("jsonwebtoken")
const { MoleculerError } = require("moleculer").Errors

class AuthProvider {
    /** @param {Logger} logger */
    /** @param {FhirAuthConfig} configuration */
    /** @param {string} rsn */
    constructor(configuration, logger, rsn) {
        /** @private */
        this.configuration = configuration
        /** @private */
        this.logger = logger

        this.rsn = rsn
    }

    /**
     * Sends a request to get token
     *
     * @return {Promise.<Token>}
     */
    async authenticate(nhsNumber) {
        try {
            const { configuration } = this

            /** @type {Options} */
            let options = {
                url: configuration.host,
                method: "POST",
                form: {
                    grant_type: configuration.grantType,
                    assertion: this.getAssertion(nhsNumber),
                },
                headers: {
                    authorization: `Basic ${Buffer.from(
                        configuration.clientId + ":" + configuration.clientSecret
                    ).toString("base64")}`,
                },
                json: true,
            }

            if (configuration.env !== "local") {
                options.agent = new https.Agent({
                    host: configuration.agentHost,
                    port: configuration.agentPort,
                    passphrase: configuration.passphrase,
                    rejectUnauthorized: true,
                    cert: configuration.certFile,
                    key: configuration.keyFile,
                    ca: configuration.caFile,
                })
            } else {
                options.rejectUnauthorized = false
            }

            if (configuration.proxy) {
                options.proxy = configuration.proxy
            }

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
    getAssertion(nhsNumber) {
        const { scope, ods, aud, rol, sub, iss, env } = this.configuration

        const { rsn } = this

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
            jti: uuid.v4(),
        }

        if (rsn === "2" && !nhsNumber) {
            throw new MoleculerError("patient id required for rsn: 2", 403)
        }

        if (nhsNumber && rsn !== "5") {
            jwtAssertion.pat = { nhs: nhsNumber }
        }

        if (env === "local") {
            return JSON.stringify(jwtAssertion)
        } else {
            const signed = jwt.sign(
                jwtAssertion,
                {
                    key: this.configuration.signingKeyFile,
                    passphrase: this.configuration.signingPassphrase,
                },
                {
                    algorithm: "RS256",
                }
            )

            return signed
        }
    }
}

module.exports = AuthProvider
