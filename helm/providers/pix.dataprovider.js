/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").FullResponse} FullResponse */
/** @typedef {import("request-promise-native").Options} Options */
/** @typedef {import("../config/config.fhirstore").FhirStoreConfig} FhirStoreConfig */

const request = require("request-promise-native")
const https = require("https")
const CoreFhirDataProvider = require("./corefhir.dataprovider")

class PixDataProvider extends CoreFhirDataProvider {
    /** @param {Logger} logger */
    /** @param {FhirStoreConfig} configuration */
    /** @param {import("./types").RequestAuthProvider} authProvider */
    constructor(configuration, logger, authProvider) {
        super(configuration, logger, authProvider)

        this.logger = logger
        this.configuration = configuration
        this.authProvider = authProvider
    }

    /** @protected */
    configure(request) {
        const { configuration } = this

        if (configuration.env !== "local") {
            request.agent = new https.Agent({
                host: configuration.agentHost,
                port: configuration.agentPort,
                passphrase: configuration.passphrase,
                rejectUnauthorized: true,
                cert: configuration.certFile,
                key: configuration.keyFile,
                ca: configuration.caFile,
            })
            request.rejectUnauthorized = true
        } else {
            request.rejectUnauthorized = false
        }

        if (configuration.proxy) {
            request.proxy = configuration.proxy
        }
    }
}

module.exports = PixDataProvider
