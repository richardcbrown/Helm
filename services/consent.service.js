/**
 * Consent Moleculer Service
 */

/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const PatientConsentProvider = require("../providers/patientconsent.provider")
const PatientConsentGenerator = require("../generators/patientconsent.generator")
const getConsentConfig = require("../config/config.consent")
const { phrUserCheckHooks } = require("../handlers/phruser.hooks")
const { getUserSubFromContext } = require("../handlers/handler.helpers")
const RedisDataProvider = require("../providers/redis.dataprovider")
const getRedisConfig = require("../config/config.redis")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<boolean>}
 * */
async function patientConsentedHandler(ctx) {
    const config = await getConsentConfig()
    const patientConsentProvider = new PatientConsentProvider(ctx, config)

    /** @type {number | string} */
    const nhsNumber = getUserSubFromContext(ctx)

    return await patientConsentProvider.patientHasConsented(nhsNumber)
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function initialiseHandler(ctx) {
    const redisConfig = await getRedisConfig()
    const cacher = new RedisDataProvider(redisConfig)

    const cacheProvider = new PatientCacheProvider(cacher)

    const patientStatus = await cacheProvider.getPendingPatientStatus(ctx.meta.user.sub)

    if (patientStatus !== PendingPatientStatus.Found) {
        return { status: patientStatus }
    }

    const consentConfig = await getConsentConfig()

    const patientConsentProvider = new PatientConsentProvider(ctx, consentConfig)

    /** @type {number | string} */
    const nhsNumber = getUserSubFromContext(ctx)

    const consent = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (!consent) {
        return { status: "sign_terms" }
    } else {
        ctx.call("userservice.createUser", { nhsNumber, jti: ctx.meta.user.jti })

        return { status: "login" }
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<{ resources: fhir.Resource[] }>}
 * */
async function getTermsHandler(ctx) {
    const config = await getConsentConfig()

    const patientConsentProvider = new PatientConsentProvider(ctx, config)

    const policies = await patientConsentProvider.getPolicies()

    return { resources: policies }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function acceptTermsHandler(ctx) {
    const config = await getConsentConfig()

    const patientConsentProvider = new PatientConsentProvider(ctx, config)
    const patientConsentGenerator = new PatientConsentGenerator(ctx, config)

    /** @type {number | string} */
    const nhsNumber = getUserSubFromContext(ctx)

    const alreadyConsented = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (alreadyConsented) {
        return { status: "login" }
    }

    /** @type {fhir.Resource[]} */
    const policies = [ctx.params["0"], ctx.params["1"]]

    await patientConsentGenerator.generatePatientConsent(nhsNumber, policies)

    const consent = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (!consent) {
        return { status: "sign_terms" }
    } else {
        return { status: "login" }
    }
}

/**
 * Manages general operations
 * around user consent
 * @type {ServiceSchema}
 */
const ConsentService = {
    name: "consentservice",
    actions: {
        patientConsented: {
            role: "phrUser",
            handler: patientConsentedHandler,
        },
        check: {
            role: "phrUser",
            handler: initialiseHandler,
        },
        initialise: {
            role: "phrUser",
            handler: initialiseHandler,
        },
        getTerms: {
            role: "phrUser",
            handler: getTermsHandler,
        },
        acceptTerms: {
            role: "phrUser",
            handler(ctx) {
                return acceptTermsHandler(ctx)
            },
        },
    },
    hooks: {
        before: {
            "*": phrUserCheckHooks,
        },
    },
}

module.exports = ConsentService
