/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").FullResponse} FullResponse */
/** @typedef {import("request-promise-native").Options} Options */
/** @typedef {import("../config/config.fhirstore").FhirStoreConfig} FhirStoreConfig */

const CoreFhirDataProvider = require("./corefhir.dataprovider")

class FhirStoreDataProvider extends CoreFhirDataProvider {
    /** @param {Logger} logger */
    /** @param {FhirStoreConfig} configuration */
    /** @param {import("./types").RequestAuthProvider} authProvider */
    constructor(configuration, logger, authProvider) {
        super(configuration, logger, authProvider)

        this.logger = logger
        this.configuration = configuration
        this.authProvider = authProvider
    }

    configure(request) {}
}

module.exports = FhirStoreDataProvider
