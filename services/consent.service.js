/**
 * Consent Moleculer Service
 */

/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const path = require("path")
const fs = require("fs")
const pg = require("pg")
const PatientConsentProvider = require("../providers/patientconsent.provider")
const PatientConsentGenerator = require("../generators/patientconsent.generator")
const { PendingConsentGenerator } = require("../generators/pendingconsent.generator")
const getConsentConfig = require("../config/config.consent")
const { phrUserCheckHooks } = require("../handlers/phruser.hooks")
const { getUserSubFromContext } = require("../handlers/handler.helpers")
const { CronJobManager } = require("../jobs/cronjobmanager")
const { NotifyPatientConsentJob } = require("../jobs/notifypatientconsent.job")
const AuthProvider = require("../providers/auth.provider")
const TokenProvider = require("../providers/token.provider")
const LcrPatientConsentGenerator = require("../generators/lcrpatientconsent.generator")
const lcrConfig = require("../config/config.lcrconsent")
const RedisDataProvider = require("../providers/redis.dataprovider")
const getRedisConfig = require("../config/config.redis")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const { InternalPatientGenerator } = require("../generators/internalpatient.generator")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<boolean>}
 * */
async function patientConsentedHandler(ctx) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())

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
    const cacher = new RedisDataProvider(getRedisConfig())

    const cacheProvider = new PatientCacheProvider(cacher)

    const patientStatus = await cacheProvider.getPendingPatientStatus(ctx.meta.user.sub)

    if (patientStatus !== PendingPatientStatus.Found) {
        return { status: patientStatus }
    }

    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())

    /** @type {number | string} */
    const nhsNumber = getUserSubFromContext(ctx)

    const consent = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (!consent) {
        return { status: "sign_terms" }
    } else {
        const internalPatientGenerator = new InternalPatientGenerator(ctx, cacheProvider)

        await internalPatientGenerator.generateInternalPatient(nhsNumber)

        return { status: "login" }
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<{ resources: fhir.Resource[] }>}
 * */
async function getTermsHandler(ctx) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())

    const policies = await patientConsentProvider.getPolicies()

    return { resources: policies }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function acceptTermsHandler(ctx, databaseClient) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())
    const patientConsentGenerator = new PatientConsentGenerator(ctx, getConsentConfig())
    const pendingConsentGenerator = new PendingConsentGenerator(ctx, databaseClient)

    /** @type {number | string} */
    const nhsNumber = getUserSubFromContext(ctx)

    const alreadyConsented = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (alreadyConsented) {
        return { status: "login" }
    }

    /** @type {fhir.Resource[]} */
    const policies = [ctx.params["0"], ctx.params["1"]]

    await patientConsentGenerator.generatePatientConsent(nhsNumber, policies)
    await pendingConsentGenerator.generatePendingConsent(nhsNumber)

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
                return acceptTermsHandler(ctx, this.connectionPool)
            },
        },
    },
    hooks: {
        before: {
            "*": phrUserCheckHooks,
        },
    },
    async created() {
        const initFile = path.join(__dirname, "helmdatabase.init.sql")

        const sql = fs.readFileSync(initFile, "utf-8")

        this.connectionPool = new pg.Pool({ max: 10 })

        await this.connectionPool.query(sql)
    },
    async started() {
        try {
            const { logger } = this

            const authProvider = new AuthProvider(lcrConfig.getAuthConfig(), logger)

            const tokenProvider = new TokenProvider(authProvider, logger)

            const lcrGenerator = new LcrPatientConsentGenerator(lcrConfig.getConfig(), tokenProvider)

            const notifyConsentJob = new NotifyPatientConsentJob(this.connectionPool, lcrGenerator)

            this.jobManager = new CronJobManager([
                {
                    pattern: "30 * * * * *",
                    process: notifyConsentJob.process,
                },
            ])

            this.jobManager.process()
        } catch (error) {
            /** @todo logging */
        }
    },
    async stopped() {
        this.jobManager.stop()
    },
}

module.exports = ConsentService
