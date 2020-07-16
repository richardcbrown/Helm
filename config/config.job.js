const path = require("path")
const getNhsLoginConfig = require("./config.nhsauth")

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConsumerConfig() {
    return {
        rabbit: {
            protocol: "amqp",
            hostname: await secretManager.getSecret("JOB_QUEUE_HOST"),
            port: await secretManager.getSecret("JOB_QUEUE_PORT"),
            frameMax: 0,
            heartbeat: 60,
        },
        registerpatientconsumer: {
            ...getNhsLoginConfig(),
            orgReference: await secretManager.getSecret("PIX_SOS_ORG_REFERENCE"),
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

module.exports = { getConsumerConfig, getProducerConfig }
