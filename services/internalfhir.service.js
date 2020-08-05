/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const TokenProvider = require("../providers/token.provider")

const fhirservice = require("./fhir.service")
const { searchActionHandler, readActionHandler, createActionHandler } = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.internalfhirstore")
const getFhirAuthConfig = require("../config/config.internalfhirauth")
const AuthProvider = require("../providers/auth.provider")
const InternalFhirDataProvider = require("../providers/internalfhirstore.dataprovider")
const EmptyTokenProvider = require("../providers/fhirstore.emptytokenprovider")

/** @type {ServiceSchema} */
const InternalFhirService = {
    name: "internalfhirservice",
    mixins: [fhirservice],
    methods: {
        async searchActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await searchActionHandler.call(this, ctx, fhirStore)
        },
        async readActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await readActionHandler.call(this, ctx, fhirStore)
        },
        async createActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await createActionHandler.call(this, ctx, fhirStore)
        },
    },
}

module.exports = InternalFhirService
