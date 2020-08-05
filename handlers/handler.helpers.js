/** @typedef {import("moleculer").Context<any, any>} Context */

const { InternalPatientGenerator } = require("../generators/internalpatient.generator")
const RedisDataProvider = require("../providers/redis.dataprovider")
const getRedisConfig = require("../config/config.redis")
const { PatientCacheProvider } = require("../providers/patientcache.provider")

/**
 * Gets the user sub from context
 * (usually nhsNumber)
 * @param {Context} ctx
 * @returns {string | number} sub
 */
function getUserSubFromContext(ctx) {
    if (!ctx.meta.user || !ctx.meta.user.role || !ctx.meta.user.sub) {
        throw Error("Sub not set")
    }

    return ctx.meta.user.sub
}

/**
 * Populates user information from request into context
 * @param {Context} ctx
 * @param {Request} req
 */
function populateContextWithUser(ctx, req) {
    // Set request headers to context meta
    if (!req.user || !req.user.sub || !req.user.role) {
        throw Error("User has not been populated")
    }

    ctx.meta.user = {
        sub: req.user.sub,
        role: req.user.role,
    }
}

/**
 * Populates user database reference into context
 * @param {Context} ctx
 * @param {Request} req
 * @return {Promise<void>}
 */
async function populateContextWithUserReference(ctx, req) {
    // Set request headers to context meta
    if (!req.user || !req.user.sub || !req.user.role) {
        throw Error("User has not been populated")
    }

    const config = await getRedisConfig()

    const cacher = new RedisDataProvider(config)

    const cacheProvider = new PatientCacheProvider(cacher)

    let reference = await cacheProvider.getPatientReference(req.user.sub)

    if (!reference) {
        const internalPatientGenerator = new InternalPatientGenerator(ctx, cacheProvider)

        await internalPatientGenerator.generateInternalPatient(req.user.sub)
    }

    reference = await cacheProvider.getPatientReference(req.user.sub)

    if (!reference) {
        throw Error(`Unable to generate internal reference for user ${req.user.sub}`)
    }

    ctx.meta.user.reference = reference
}

class PatientNotConsentedError extends Error {
    constructor(message) {
        super(message)
        this.name = "PatientNotConsentedError"
    }
}

/**
 * Populates user information from request into context
 * @param {Context} ctx
 */
async function checkUserConsent(ctx) {
    const consented = await ctx.call("consentservice.patientConsented")

    if (consented) {
        return
    }

    throw new PatientNotConsentedError()
}

module.exports = {
    getUserSubFromContext,
    populateContextWithUser,
    checkUserConsent,
    PatientNotConsentedError,
    populateContextWithUserReference,
}
