/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const TokenProvider = require("../providers/token.provider")

const fhirservice = require("./fhir.service")
const { searchActionHandler, readActionHandler, createActionHandler } = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.internalfhirstore")
const EmptyAuthProvider = require("../providers/fhirstore.emptyauthprovider")
const AuthProvider = require("../providers/auth.provider")
const InternalFhirDataProvider = require("../providers/internalfhirstore.dataprovider")

/** @type {ServiceSchema} */
const InternalFhirService = {
    name: "internalfhirservice",
    mixins: [fhirservice],
    methods: {
        async searchActionHandler(ctx) {
            const authProvider = new AuthProvider(
                {
                    clientId: "helm",
                    clientSecret: "helm",
                    grantType: "client_credentials",
                    host: "http://localhost:8080/token",
                    scope: "internal",
                },
                this.logger
            )
            const tokenProvider = new TokenProvider(authProvider, this.logger)

            const fhirStore = new InternalFhirDataProvider(getFhirStoreConfig(), this.logger, tokenProvider)

            return await searchActionHandler.call(this, ctx, fhirStore)
        },
        async readActionHandler(ctx) {
            const authProvider = new AuthProvider(
                {
                    clientId: "helm",
                    clientSecret: "helm",
                    grantType: "client_credentials",
                    host: "http://localhost:8080/token",
                    scope: "internal",
                },
                this.logger
            )

            const tokenProvider = new TokenProvider(authProvider, this.logger)

            const fhirStore = new InternalFhirDataProvider(getFhirStoreConfig(), this.logger, tokenProvider)

            return await readActionHandler.call(this, ctx, fhirStore)
        },
        async createActionHandler(ctx) {
            const authProvider = new AuthProvider(
                {
                    clientId: "helm",
                    clientSecret: "helm",
                    grantType: "client_credentials",
                    host: "http://localhost:8080/token",
                    scope: "internal",
                },
                this.logger
            )

            const tokenProvider = new TokenProvider(authProvider, this.logger)

            const fhirStore = new InternalFhirDataProvider(getFhirStoreConfig(), this.logger, tokenProvider)

            return await createActionHandler.call(this, ctx, fhirStore)
        },
    },
}

module.exports = InternalFhirService
