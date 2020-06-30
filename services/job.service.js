/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const RedisDataProvider = require("../providers/redis.dataprovider")
const PixDataProvider = require("../providers/pix.dataprovider")
const FhirStoreDataProvider = require("../providers/fhirstore.dataprovider")
const TokenProvider = require("../providers/token.provider")
const AuthProvider = require("../providers/fhirstore.authprovider")
const { JobType, JobProducerProvider } = require("../jobs/jobproducer.provider")
const { JobConsumerProvider } = require("../jobs/jobconsumer.provider")
const { getProducerConfig, getConsumerConfig } = require("../config/config.job")
const getFhirStoreConfig = require("../config/config.fhirstore")
const getFhirAuthConfig = require("../config/config.fhirauth")
const getPixAuthConfig = require("../config/config.pixauth")
const getRedisConfig = require("../config/config.redis")
const getPixConfig = require("../config/config.pix")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function addJobHandler(ctx) {
    const jobType = ctx.params.jobType
    const payload = ctx.params.payload

    const jobProducerProvider = new JobProducerProvider(getProducerConfig())

    const jobProducer = jobProducerProvider.getJobProducer(jobType)

    await jobProducer.addJob(jobType, payload)
}

/** @type {ServiceSchema} */
const JobService = {
    name: "jobservice",
    actions: {
        addjob: {
            handler: addJobHandler,
        },
        async patientlogin(ctx) {
            const cacher = new RedisDataProvider(getRedisConfig())

            const { nhsNumber, token } = ctx.params

            const cacheProvider = new PatientCacheProvider(cacher)

            await cacheProvider.setPendingPatientStatus(nhsNumber, PendingPatientStatus.Received)
            // send token off to process patient information
            ctx.call("jobservice.addjob", {
                jobType: JobType.RegisterPatientJob,
                payload: { token, nhsNumber },
            })
        },
    },
    async started() {
        try {
            const { logger } = this

            const auth = new AuthProvider(getFhirAuthConfig(), logger, 2)
            const pixauth = new AuthProvider(getPixAuthConfig(), logger, 2)
            const adminAuth = new AuthProvider(getFhirAuthConfig(), logger, 5)
            const adminTokenProvider = new TokenProvider(adminAuth, logger)
            const pixTokenProvider = new TokenProvider(pixauth, logger)
            const tokenProvider = new TokenProvider(auth, logger)
            const fhirDataProvider = new FhirStoreDataProvider(getFhirStoreConfig(), logger, tokenProvider)
            const adminFhirDataProvider = new FhirStoreDataProvider(getFhirStoreConfig(), logger, adminTokenProvider)
            const pixDataProvider = new PixDataProvider(getPixConfig(), logger, pixTokenProvider)

            const cacher = new PatientCacheProvider(new RedisDataProvider(getRedisConfig()))

            const jobProducerProvider = new JobProducerProvider(getProducerConfig())

            const jobConsumerProvider = new JobConsumerProvider(
                getConsumerConfig(),
                jobProducerProvider,
                pixDataProvider,
                fhirDataProvider,
                cacher,
                logger,
                adminFhirDataProvider
            )

            const pendingConsumer = jobConsumerProvider.getJobConsumer(JobType.RegisterPatientJob)
            const lookupConsumer = jobConsumerProvider.getJobConsumer(JobType.LookupPatientJob)

            this.pendingConsumer = pendingConsumer
            this.lookupConsumer = lookupConsumer

            pendingConsumer.consumeJob()
            lookupConsumer.consumeJob()
        } catch (error) {
            /** @todo logging */
        }
    },
    async stopped() {},
}

module.exports = JobService
