/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { searchActionHandler, readActionHandler, createActionHandler } = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.fhirstore")
const getFhirAuthConfig = require("../config/config.fhirauth")
const TokenProvider = require("../providers/fhirstore.tokenprovider")
const AuthProvider = require("../providers/fhirstore.authprovider")
const FhirDataProvider = require("../providers/fhirstore.dataprovider")

const adminResources = ["Consent", "Policy"]

function getAuthProviderForResourceType(resourceType, authConfig, logger) {
    let rsn = 2

    console.log(resourceType)

    if (adminResources.includes(resourceType)) {
        rsn = 5
    }

    const auth = new AuthProvider(authConfig, logger, rsn)
    return new TokenProvider(auth, logger)
}

/** @type {ServiceSchema} */
const FhirService = {
    name: "fhirservice",
    actions: {
        search: {
            params: {
                resourceType: { type: "string" },
            },
            handler(ctx) {
                return this.searchActionHandler(ctx)
            },
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
            handler(ctx) {
                return this.createActionHandler(ctx)
            },
        },
    },
    methods: {
        async searchActionHandler(ctx) {
            const { logger } = this

            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            const tokenProvider = getAuthProviderForResourceType(ctx.params.resourceType, authConfig, logger)

            const fhirStore = new FhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await searchActionHandler.call(this, ctx, fhirStore)
        },
        async readActionHandler(ctx) {
            const { logger } = this

            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            const tokenProvider = getAuthProviderForResourceType(ctx.params.resourceType, authConfig, logger)

            const fhirStore = new FhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await readActionHandler.call(this, ctx, fhirStore)
        },
        async createActionHandler(ctx) {
            const { logger } = this

            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            const tokenProvider = getAuthProviderForResourceType(ctx.params.resourceType, authConfig, logger)

            const fhirStore = new FhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await createActionHandler.call(this, ctx, fhirStore)
        },
    },
}

module.exports = FhirService
