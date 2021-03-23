/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const pg = require("pg")
const CronJob = require("cron").CronJob
const getDatabaseConfiguration = require("../config/config.database")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const RedisDataProvider = require("../providers/redis.dataprovider")
const PixDataProvider = require("../providers/pix.dataprovider")
const FhirStoreDataProvider = require("../providers/fhirstore.dataprovider")
const TokenProvider = require("../providers/token.provider")
const AuthProvider = require("../providers/fhirstore.authprovider")
const InternalFhirDataProvider = require("../providers/internalfhirstore.dataprovider")
const { JobType, JobProducerProvider } = require("../jobs/jobproducer.provider")
const { JobConsumerProvider } = require("../jobs/jobconsumer.provider")
const { getProducerConfig, getConsumerConfig, getCronConfig } = require("../config/config.job")
const getFhirStoreConfig = require("../config/config.fhirstore")
const getFhirAuthConfig = require("../config/config.fhirauth")
const getPixAuthConfig = require("../config/config.pixauth")
const getRedisConfig = require("../config/config.redis")
const getPixConfig = require("../config/config.pix")
const getInternalFhirStoreConfig = require("../config/config.internalfhirstore")
const TokenDataClient = require("../clients/token.dataclient")
const InternalAuthProvider = require("../providers/internal.authprovider")

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

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function revokeOldTokensHandler(ctx, connectionPool) {
    const tokenDataClient = new TokenDataClient(connectionPool)

    const revoked = await tokenDataClient.revokeTokens()

    revoked.forEach((revokedToken) => applyTokenMetrics(ctx, revokedToken))
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function revokeOldTokenHandler(ctx, connectionPool) {
    const { jti } = ctx.params

    const tokenDataClient = new TokenDataClient(connectionPool)

    const revokedToken = await tokenDataClient.revokeToken(jti)

    if (!revokedToken) {
        return
    }

    applyTokenMetrics(ctx, revokedToken)
}

function applyTokenMetrics(ctx, revokedToken) {
    const sessionDuration = revokedToken.lastActive ? revokedToken.lastActive - revokedToken.issued : null

    if (sessionDuration) {
        ctx.call("metricsservice.sessionDuration", {
            duration: sessionDuration,
            sessionId: revokedToken.jti,
            userId: revokedToken.userId,
        })
    }

    if (revokedToken.totalPages <= 1) {
        ctx.call("metricsservice.bouncedSession", { sessionId: revokedToken.jti, userId: revokedToken.userId })
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function measureActiveTokensHandler(ctx, connectionPool) {
    const tokenDataClient = new TokenDataClient(connectionPool)

    const activeTokens = await tokenDataClient.getActiveTokens()

    ctx.call("metricsservice.activeUsers", { activeUsers: activeTokens.length })
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function removeOldTokensHandler(ctx, connectionPool) {
    const tokenDataClient = new TokenDataClient(connectionPool)

    await tokenDataClient.clearRevokedTokens()
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

            const cacher = new RedisDataProvider(redisConfig, this.logger)

            const { nhsNumber, token } = ctx.params

            const cacheProvider = new PatientCacheProvider(cacher)

            await cacheProvider.setPendingPatientStatus(nhsNumber, PendingPatientStatus.Received)
            // send token off to process patient information
            ctx.call("jobservice.addjob", {
                jobType: JobType.RegisterPatientJob,
                payload: { token, nhsNumber },
            })
        },
        revokeOldTokens: {
            handler(ctx) {
                return revokeOldTokensHandler(ctx, this.connectionPool)
            },
        },
        revokeOldToken: {
            handler(ctx) {
                return revokeOldTokenHandler(ctx, this.connectionPool)
            },
        },
        removeOldTokens: {
            handler(ctx) {
                return removeOldTokensHandler(ctx, this.connectionPool)
            },
        },
        activeTokens: {
            handler(ctx) {
                return measureActiveTokensHandler(ctx, this.connectionPool)
            },
        },
    },
    async started() {
        try {
            const { logger } = this

            const config = await getDatabaseConfiguration()

            this.connectionPool = new pg.Pool(config)

            const fhirAuthConfig = await getFhirAuthConfig()
            const pixAuthConfig = await getPixAuthConfig()
            const fhirStoreConfig = await getFhirStoreConfig()
            const pixConfig = await getPixConfig()
            const redisConfig = await getRedisConfig()
            const producerConfig = await getProducerConfig()
            const consumerConfig = await getConsumerConfig()

            const storeConfig = await getInternalFhirStoreConfig()

            const auth = new AuthProvider(fhirAuthConfig, logger, "2")
            const pixauth = new AuthProvider(pixAuthConfig, logger, "2")
            const adminAuth = new AuthProvider(fhirAuthConfig, logger, "5")
            const adminTokenProvider = new TokenProvider(adminAuth, logger)
            const pixTokenProvider = new TokenProvider(pixauth, logger)
            const tokenProvider = new TokenProvider(auth, logger)
            const fhirDataProvider = new FhirStoreDataProvider(fhirStoreConfig, logger, tokenProvider)
            const adminFhirDataProvider = new FhirStoreDataProvider(fhirStoreConfig, logger, adminTokenProvider)
            const pixDataProvider = new PixDataProvider(pixConfig, logger, pixTokenProvider)

            const authProvider = new InternalAuthProvider()

            const internalTokenProvider = {
                authorize: async (request) => {
                    const token = await authProvider.authenticate({ sub: "internal" })

                    request.auth = { bearer: token.access_token }
                },
            }

            const internalFhirStore = new InternalFhirDataProvider(storeConfig, this.logger, internalTokenProvider)

            const cacher = new PatientCacheProvider(new RedisDataProvider(redisConfig, this.logger))

            const jobProducerProvider = new JobProducerProvider(producerConfig)

            const jobConsumerProvider = new JobConsumerProvider(
                consumerConfig,
                jobProducerProvider,
                pixDataProvider,
                fhirDataProvider,
                cacher,
                logger,
                adminFhirDataProvider,
                internalFhirStore
            )

            const pendingConsumer = jobConsumerProvider.getJobConsumer(JobType.RegisterPatientJob)
            const lookupConsumer = jobConsumerProvider.getJobConsumer(JobType.LookupPatientJob)

            this.pendingConsumer = pendingConsumer
            this.lookupConsumer = lookupConsumer

            pendingConsumer.consumeJob()
            lookupConsumer.consumeJob()

            const cronConfiguration = await getCronConfig()

            this.crons = []

            const revokeOldTokensJob = new CronJob(cronConfiguration.revokeOldTokensCron, () => {
                this.actions.revokeOldTokens()
            })

            const removeOldTokensCron = new CronJob(cronConfiguration.removeOldTokensCron, () => {
                this.actions.removeOldTokens()
            })

            const activeTokensCron = new CronJob(cronConfiguration.activeTokensCron, () => {
                this.actions.activeTokens()
            })

            this.crons.push(revokeOldTokensJob)
            this.crons.push(removeOldTokensCron)
            this.crons.push(activeTokensCron)

            this.crons.forEach((job) => job.start())
        } catch (error) {
            this.logger.error(error.stack || error.message)
            throw error
        }
    },
    async stopped() {
        try {
            if (this.connectionPool) {
                await this.connectionPool.end()
            }

            this.crons.forEach((job) => job.stop())
        } catch (error) {
            this.logger.error(error.stack || error.message)
            throw error
        }
    },
}

module.exports = JobService
