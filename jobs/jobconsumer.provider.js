const amqplib = require("amqplib")
const { JobType } = require("./jobproducer.provider")
const RegisterPatientConsumer = require("./registerpatient.consumer")
const LookupPatientConsumer = require("./lookuppatient.consumer")

class RabbitJobConsumer {
    constructor(configuration, jobType, consumer, logger) {
        this.configuration = configuration
        this.consumer = consumer
        this.jobType = jobType
        this.logger = logger
    }

    async consumeJob() {
        const queue = await this.getQueue(this.jobType)

        queue.consume(this.jobType, (message) => this.consume(queue, message))
    }

    /**
     *
     * @param {import("amqplib").Channel} queue
     * @param {import("amqplib").ConsumeMessage} message
     */
    async consume(queue, message) {
        try {
            const result = await this.consumer.consume(message)

            if (result.success) {
                queue.ack(message)
            } else {
                queue.reject(message, false)

                if (result.retry) {
                    const retries = message.properties.headers["x-retry-count"]

                    let count = Number(retries) || 1

                    count += 1

                    if (count <= this.configuration.retryCount) {
                        const channel = await this.getDelayExchange(this.jobType)

                        channel.publish(this.jobType, this.jobType, message.content, {
                            headers: { "x-delay": 5000, "x-retry-count": count },
                        })
                    } else {
                        const deadChannel = await this.getExchange("dead")

                        deadChannel.publish("dead", "dead", message.content)

                        this.consumer.error(message)
                    }
                } else {
                    this.consumer.error(message)
                }
            }
        } catch (error) {
            queue.reject(message, false)
            this.consumer.error(message)
            this.logger.error(error.stack || error.message)
        }
    }

    async getQueue(jobType) {
        try {
            const queueConnection = await amqplib.connect(this.configuration)

            const channel = await queueConnection.createChannel()

            await channel.assertQueue(jobType)

            return channel
        } catch (error) {
            this.logger.error(error.stack || error.message)

            await new Promise((resolve) => setTimeout(() => resolve(), 5000))

            return await this.getQueue(jobType)
        }
    }

    async getDelayExchange(jobType) {
        try {
            const queueConnection = await amqplib.connect(this.configuration)

            const channel = await queueConnection.createChannel()

            await channel.assertExchange(jobType, "x-delayed-message", { arguments: { "x-delayed-type": "direct" } })
            await channel.assertQueue(jobType)

            await channel.bindQueue(jobType, jobType, jobType)

            return channel
        } catch (error) {
            this.logger.error(error.stack || error.message)

            await new Promise((resolve) => setTimeout(() => resolve(), 5000))

            return await this.getDelayExchange(jobType)
        }
    }

    async getExchange(exchange) {
        try {
            const queueConnection = await amqplib.connect(this.configuration)

            const channel = await queueConnection.createChannel()

            await channel.assertExchange(exchange, "direct")
            await channel.assertQueue(exchange)

            await channel.bindQueue(exchange, exchange, exchange)

            return channel
        } catch (error) {
            this.logger.error(error.stack || error.message)

            await new Promise((resolve) => setTimeout(() => resolve(), 5000))

            return await this.getExchange(exchange)
        }
    }
}

class JobConsumerProvider {
    constructor(
        configuration,
        jobProducerProvider,
        pixDataProvider,
        fhirDataProvider,
        cacher,
        logger,
        adminFhirDataProvider,
        internalFhirStore
    ) {
        this.configuration = configuration
        this.pixDataProvider = pixDataProvider
        this.fhirDataProvider = fhirDataProvider
        this.cacher = cacher
        this.logger = logger
        this.jobProducerProvider = jobProducerProvider
        this.adminFhirDataProvider = adminFhirDataProvider
        this.internalFhirStore = internalFhirStore
    }

    getJobConsumer(jobType) {
        switch (jobType) {
            case JobType.RegisterPatientJob: {
                const registerPatientConsumer = new RegisterPatientConsumer(
                    this.pixDataProvider,
                    this.jobProducerProvider,
                    this.cacher,
                    this.logger,
                    this.configuration.registerpatientconsumer,
                    this.adminFhirDataProvider,
                    this.internalFhirStore
                )

                return new RabbitJobConsumer(this.configuration.rabbit, jobType, registerPatientConsumer, this.logger)
            }
            case JobType.LookupPatientJob: {
                const lookupPatientConsumer = new LookupPatientConsumer(
                    this.jobProducerProvider,
                    this.cacher,
                    this.logger,
                    this.fhirDataProvider,
                    this.configuration.lookuppatientconsumer
                )

                return new RabbitJobConsumer(this.configuration.rabbit, jobType, lookupPatientConsumer, this.logger)
            }
            default: {
                throw Error(`Job type ${jobType} does not exist`)
            }
        }
    }
}

module.exports = { JobConsumerProvider }
