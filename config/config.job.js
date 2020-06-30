const path = require("path")
const getNhsLoginConfig = require("./config.nhsauth")

function getConsumerConfig() {
    return {
        rabbit: {
            protocol: "amqp",
            hostname: `${process.env.JOB_QUEUE_HOST}`,
            port: `${process.env.JOB_QUEUE_PORT}`,
            frameMax: 0,
            heartbeat: 60,
        },
        registerpatientconsumer: { ...getNhsLoginConfig(), orgReference: process.env.PIX_SOS_ORG_REFERENCE },
    }
}

function getProducerConfig() {
    return {
        rabbit: {
            protocol: "amqp",
            hostname: `${process.env.JOB_QUEUE_HOST}`,
            port: `${process.env.JOB_QUEUE_PORT}`,
            frameMax: 0,
            heartbeat: 60,
        },
    }
}

module.exports = { getConsumerConfig, getProducerConfig }
