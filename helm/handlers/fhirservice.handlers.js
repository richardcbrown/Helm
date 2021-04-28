/** @typedef {import("../services/types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { MoleculerError } = require("moleculer").Errors

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
        throw new MoleculerError("Resource type missing from resource", 400)
    }

    const { sub } = ctx.meta.user

    return await fhirStore.create(resourceType, resource, sub)
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function updateActionHandler(ctx, fhirStore) {
    const { logger } = this

    /** @type {fhir.Resource} */
    const resource = ctx.params.resource
    const resourceType = ctx.params.resourceType
    const resourceId = ctx.params.resourceId

    if (!resourceType) {
        throw new MoleculerError("Resource type missing from resource", 400)
    }

    if (!resourceId) {
        throw new MoleculerError("Resource id missing from resource", 400)
    }

    const { sub } = ctx.meta.user

    return await fhirStore.update(resourceType, resourceId, resource, sub)
}

module.exports = {
    createActionHandler,
    readActionHandler,
    searchActionHandler,
    updateActionHandler,
}
