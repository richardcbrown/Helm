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

    const config = await getProducerConfig()

    const jobProducerProvider = new JobProducerProvider(config)

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
            const redisConfig = await getRedisConfig()

            const cacher = new RedisDataProvider(redisConfig)

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

            const fhirAuthConfig = await getFhirAuthConfig()
            const pixAuthConfig = await getPixAuthConfig()
            const fhirStoreConfig = await getFhirStoreConfig()
            const pixConfig = await getPixConfig()
            const redisConfig = await getRedisConfig()
            const producerConfig = await getProducerConfig()
            const consumerConfig = await getConsumerConfig()

            const auth = new AuthProvider(fhirAuthConfig, logger, 2)
            const pixauth = new AuthProvider(pixAuthConfig, logger, 2)
            const adminAuth = new AuthProvider(fhirAuthConfig, logger, 5)
            const adminTokenProvider = new TokenProvider(adminAuth, logger)
            const pixTokenProvider = new TokenProvider(pixauth, logger)
            const tokenProvider = new TokenProvider(auth, logger)
            const fhirDataProvider = new FhirStoreDataProvider(fhirStoreConfig, logger, tokenProvider)
            const adminFhirDataProvider = new FhirStoreDataProvider(fhirStoreConfig, logger, adminTokenProvider)
            const pixDataProvider = new PixDataProvider(pixConfig, logger, pixTokenProvider)

            const cacher = new PatientCacheProvider(new RedisDataProvider(redisConfig))

            const jobProducerProvider = new JobProducerProvider(producerConfig)

            const jobConsumerProvider = new JobConsumerProvider(
                consumerConfig,
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
            console.log(error)
        }
    },
    async stopped() {},
}

module.exports = JobService
