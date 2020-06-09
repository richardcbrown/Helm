/** @typedef {import("../services/types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const FhirStoreDataProvider = require("../providers/fhirstore.dataprovider")

/**
 * @this {Service}
 * @param {Context} ctx
 * @param {() => import("../config/types").FhirStoreConfig} getFhirStoreConfig
 * @param {import("../providers/types").RequestAuthProvider} authProvider
 * @returns {Promise<fhir.Bundle>}
 * */
async function searchActionHandler(ctx, getFhirStoreConfig, authProvider) {
    const { logger } = this

    const fhirStore = new FhirStoreDataProvider(getFhirStoreConfig(), logger, authProvider)

    const { resourceType, query } = ctx.params

    const result = await fhirStore.search(resourceType, query)

    return result
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @param {() => import("../config/types").FhirStoreConfig} getFhirStoreConfig
 * @param {import("../providers/types").RequestAuthProvider} authProvider
 * @returns {Promise<fhir.Resource>}
 * */
async function readActionHandler(ctx, getFhirStoreConfig, authProvider) {
    const { logger } = this

    const fhirStore = new FhirStoreDataProvider(getFhirStoreConfig(), logger, authProvider)

    const { resourceType, resourceId } = ctx.params

    const result = await fhirStore.read(resourceType, resourceId)

    return result
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @param {() => import("../config/types").FhirStoreConfig} getFhirStoreConfig
 * @param {import("../providers/types").RequestAuthProvider} authProvider
 * @returns {Promise<void>}
 * */
async function createActionHandler(ctx, getFhirStoreConfig, authProvider) {
    const { logger } = this

    const fhirStore = new FhirStoreDataProvider(getFhirStoreConfig(), logger, authProvider)

    /** @type {fhir.Resource} */
    const resource = ctx.params.resource

    const resourceType = resource.resourceType

    if (!resourceType) {
        throw Error("Resource type missing from resource")
    }

    await fhirStore.create(resourceType, resource)
}

module.exports = {
    createActionHandler,
    readActionHandler,
    searchActionHandler,
}
