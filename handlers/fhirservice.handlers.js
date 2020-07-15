/** @typedef {import("../services/types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<fhir.Bundle>}
 * */
async function searchActionHandler(ctx, fhirStore) {
    const { logger } = this

    const { sub } = ctx.meta.user

    const { resourceType, query } = ctx.params

    const result = await fhirStore.search(resourceType, query, sub)

    return result
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<fhir.Resource>}
 * */
async function readActionHandler(ctx, fhirStore) {
    const { logger } = this

    const { sub } = ctx.meta.user

    const { resourceType, resourceId } = ctx.params

    const result = await fhirStore.read(resourceType, resourceId, sub)

    return result
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function createActionHandler(ctx, fhirStore) {
    const { logger } = this

    /** @type {fhir.Resource} */
    const resource = ctx.params.resource
    const resourceType = ctx.params.resourceType

    if (!resourceType) {
        throw Error("Resource type missing from resource")
    }

    const { sub } = ctx.meta.user

    await fhirStore.create(resourceType, resource, sub)
}

module.exports = {
    createActionHandler,
    readActionHandler,
    searchActionHandler,
}
