const path = require("path")

function getConsumerConfig() {
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
