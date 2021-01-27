const FhirStoreDataProvider = require("../providers/fhirstore.dataprovider")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const { JobProducerProvider } = require("./jobproducer.provider")

const amqplib = require("amqplib")
const { JobType } = require("./jobproducer.provider")
const { matchCoding } = require("../models/coding.helpers")
const RegisterPatientConsumer = require("./registerpatient.consumer")

const retryCount = 5

/**
 *
 * @param {fhir.Patient} patient
 */
function isResolved(patient) {
    return isResolvedByCode(patient, "01")
}

/**
 *
 * @param {fhir.Patient} patient
 */
function isPartiallyResolved(patient) {
    return isResolvedByCode(patient, "02")
}

/**
 * @param {string} code
 * @param {fhir.Patient} patient
 */
function isResolvedByCode(patient, code) {
    const { identifier } = patient

    if (!identifier) {
        return false
    }

    const nhsNumberIdentifier = identifier.find((id) => id.system === "https://fhir.nhs.uk/Id/nhs-number")

    if (!nhsNumberIdentifier) {
        return false
    }

    const { extension } = nhsNumberIdentifier

    if (!extension) {
        return false
    }

    const nhsVerifiedExtension = extension.find((ex) => {
        return (
            ex.valueCodeableConcept &&
            matchCoding(ex.valueCodeableConcept, [
                {
                    system: "https://fhir.hl7.org.uk/STU3/CodeSystem/CareConnect-NHSNumberVerificationStatus-1",
                    code,
                },
                {
                    system: "https://fhir.hl7.org.uk/STU3/ValueSet/CareConnect-NHSNumberVerificationStatus-1",
                    code,
                },
            ])
        )
    })

    return !!nhsVerifiedExtension
}

class LookupPatientConsumer {
    /**
     * @param {JobProducerProvider} jobProducerProvider
     * @param {PatientCacheProvider} patientCache
     * @param {*} logger
     * @param {FhirStoreDataProvider} fhirDataProvider
     */
    constructor(jobProducerProvider, patientCache, logger, fhirDataProvider) {
        this.jobProducerProvider = jobProducerProvider
        this.patientCache = patientCache
        this.logger = logger
        this.fhirDataProvider = fhirDataProvider
        this.consume = this.consume.bind(this)
    }

    error(message) {
        this.logger.error("LookupPatientConsumer error")
        this.logger.error(message)

        const { content } = message

        const payload = JSON.parse(content.toString())

        this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.NotFound)
    }

    /**
     * @param {import("amqplib").ConsumeMessage} message
     */
    async consume(message) {
        try {
            const { content } = message

            const payload = JSON.parse(content.toString())

            if (!payload.nhsNumber) {
                throw Error(`Message payload is missing NHS number`)
            }

            if (!payload.reference) {
                throw Error(`Message payload is missing patient reference`)
            }

            this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.Searching)

            const referenceComps = payload.reference.split("/")

            const [resourceType, resourceId] = referenceComps.slice(Math.max(referenceComps.length - 2, 0))

            const patient = /** @type {fhir.Patient} */ (await this.fhirDataProvider.read(
                resourceType,
                resourceId,
                payload.nhsNumber
            ))

            if (isResolved(patient)) {
                this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.Found)

                return {
                    success: true,
                }
            } else {
                const count = message.properties.headers["x-retry-count"]
                // max retries reached
                // fallback to partial resolution
                if (count >= retryCount && isPartiallyResolved(patient)) {
                    this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.Found)

                    return {
                        success: true,
                    }
                }

                return {
                    success: false,
                    retry: true,
                }
            }
        } catch (error) {
            this.logger.error(error.stack || error.message)

            return {
                success: false,
                message: error.message,
                stack: error.stack,
            }
        }
    }
}

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

                    if (count <= retryCount) {
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
                    this.fhirDataProvider
                )

                return new RabbitJobConsumer(
                    { ...this.configuration.rabbit, ...this.configuration.lookuppatientconsumer },
                    jobType,
                    lookupPatientConsumer,
                    this.logger
                )
            }
            default: {
                throw Error(`Job type ${jobType} does not exist`)
            }
        }
    }
}

module.exports = { JobConsumerProvider }
