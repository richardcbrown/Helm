/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { searchActionHandler, readActionHandler, createActionHandler } = require("./fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.fhirstore")
const getFhirAuthConfig = require("../config/config.fhirauth")
const TokenProvider = require("../providers/fhirstore.tokenprovider")
const AuthProvider = require("../providers/fhirstore.authprovider")

/** @type {ServiceSchema} */
const FhirService = {
    name: "fhirservice",
    actions: {
        search: {
            params: {
                resourceType: { type: "string" },
            },
            handler: (ctx) => this.searchActionHandler(ctx),
        },
        read: {
            params: {
                resourceType: { type: "string" },
                resourceId: { type: "string" },
            },
            handler(ctx) {
                return this.readActionHandler(ctx)
            },
        },
        create: {
            params: {
                resource: { type: "object" },
            },
            handler: (ctx) => this.createActionHandler(ctx),
        },
    },
    methods: {
        async searchActionHandler(ctx) {
            const { logger } = this

            const auth = new AuthProvider(getFhirAuthConfig(), logger)
            const tokenProvider = new TokenProvider(auth, logger)

            return await searchActionHandler.call(this, ctx, getFhirStoreConfig, tokenProvider)
        },
        async readActionHandler(ctx) {
            const { logger } = this

            const auth = new AuthProvider(getFhirAuthConfig(), logger)
            const tokenProvider = new TokenProvider(auth, logger)

            return await readActionHandler.call(this, ctx, getFhirStoreConfig, tokenProvider)
        },
        async createActionHandler(ctx) {
            const { logger } = this

            const auth = new AuthProvider(getFhirAuthConfig(), logger)
            const tokenProvider = new TokenProvider(auth, logger)

            return await createActionHandler.call(this, ctx, getFhirStoreConfig, tokenProvider)
        },
    },
}

module.exports = FhirService
