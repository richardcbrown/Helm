/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { JobType, JobProducerProvider } = require("../jobs/jobproducer.provider")
const { JobConsumerProvider } = require("../jobs/jobconsumer.provider")
const { getProducerConfig, getConsumerConfig } = require("../config/config.job")

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
    },
    async started() {
        try {
            const jobConsumerProvider = new JobConsumerProvider(getConsumerConfig())

            const pendingPatientConsumer = jobConsumerProvider.getJobConsumer(JobType.PendingPatientJob)

            pendingPatientConsumer.consumeJob()

            this.pendingPatientConsumer = pendingPatientConsumer
        } catch (error) {
            /** @todo logging */
        }
    },
    async stopped() {},
}

module.exports = JobService
