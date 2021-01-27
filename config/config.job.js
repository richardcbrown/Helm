const path = require("path")
const getNhsLoginConfig = require("./config.nhsauth")

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConsumerConfig() {
    const nhsAuthConfig = await getNhsLoginConfig()

    const retryCountConfig = await secretManager.getSecret("LOOKUP_PATIENT_RETRY_COUNT")

    const retryCount = isNaN(Number(retryCountConfig)) ? 0 : Number(retryCountConfig)

    return {
        rabbit: {
            protocol: "amqp",
            hostname: await secretManager.getSecret("JOB_QUEUE_HOST"),
            port: await secretManager.getSecret("JOB_QUEUE_PORT"),
            frameMax: 0,
            heartbeat: 60,
        },
        registerpatientconsumer: {
            ...nhsAuthConfig,
            orgReference: await secretManager.getSecret("PIX_SOS_ORG_REFERENCE"),
        },
        lookuppatientconsumer: {
            retryCount,
        },
    }
}

async function getProducerConfig() {
    return {
        rabbit: {
            protocol: "amqp",
            hostname: await secretManager.getSecret("JOB_QUEUE_HOST"),
            port: await secretManager.getSecret("JOB_QUEUE_PORT"),
            frameMax: 0,
            heartbeat: 60,
        },
    }
}

async function getCronConfig() {
    return {
        removeOldTokensCron: await secretManager.getSecret("REMOVE_OLD_TOKENS_CRON"),
        revokeOldTokensCron: await secretManager.getSecret("REVOKE_OLD_TOKENS_CRON"),
    }
}

module.exports = { getConsumerConfig, getProducerConfig, getCronConfig }
