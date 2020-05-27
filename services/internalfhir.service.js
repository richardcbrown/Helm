/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const fhirservice = require("./fhir.service")
const { searchActionHandler, readActionHandler, createActionHandler } = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.internalfhirstore")
const EmptyAuthProvider = require("../providers/fhirstore.emptyauthprovider")

/** @type {ServiceSchema} */
const InternalFhirService = {
    name: "internalfhirservice",
    mixins: [fhirservice],
    methods: {
        async searchActionHandler(ctx) {
            const authProvider = new EmptyAuthProvider()

            return await searchActionHandler.call(this, ctx, getFhirStoreConfig, authProvider)
        },
        async readActionHandler(ctx) {
            const authProvider = new EmptyAuthProvider()

            return await readActionHandler.call(this, ctx, getFhirStoreConfig, authProvider)
        },
        async createActionHandler(ctx) {
            const authProvider = new EmptyAuthProvider()

            return await createActionHandler.call(this, ctx, getFhirStoreConfig, authProvider)
        },
    },
}

module.exports = InternalFhirService
