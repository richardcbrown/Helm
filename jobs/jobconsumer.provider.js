const FhirStoreDataProvider = require("../providers/fhirstore.dataprovider")
const PixDataProvider = require("../providers/pix.dataprovider")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const { JobProducerProvider } = require("./jobproducer.provider")

const amqplib = require("amqplib")
const request = require("request-promise-native")
const uuid = require("uuid")

const { JobType } = require("./jobproducer.provider")
const { matchCoding } = require("../models/coding.helpers")

/**
 *
 * @param {fhir.Patient} patient
 */
function isResolved(patient) {
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
            matchCoding(ex.valueCodeableConcept, {
                system: "https://fhir.hl7.org.uk/STU3/CodeSystem/CareConnect-NHSNumberVerificationStatus-1",
                code: "01",
            })
        )
    })

    console.log("Nhs verified status")
    console.log(nhsVerifiedExtension)

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
        const { content } = message

        const payload = JSON.parse(content.toString())

        this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.NotFound)
    }

    /**
     * @param {import("amqplib").ConsumeMessage} message
     */
    async consume(message) {
        try {
            console.log(message)

            const { content } = message

            const payload = JSON.parse(content.toString())

            if (!payload.nhsNumber) {
                throw Error(`Message payload is missing NHS number`)
            }

            if (!payload.reference) {
                throw Error(`Message payload is missing patient reference`)
            }

            console.log(`Looking up patient: ${payload.nhsNumber}, ${payload.reference}`)

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
                return {
                    success: false,
                    retry: true,
                }
            }
        } catch (error) {
            this.logger.error(error.message, { stack: error.stack })

            return {
                success: false,
                message: error.message,
                stack: error.stack,
            }
        }
    }
}

/**
 * @param {fhir.Linkage} linkage
 */
function getReferenceFromLinkage(linkage) {
    const { item } = linkage

    const patientReferenceItem = item.find((i) => i.type === "source")

    if (!patientReferenceItem) {
        throw Error(`Patient reference item not found for Linkage ${linkage.id}`)
    }

    const patientReference = (patientReferenceItem.resource && patientReferenceItem.resource.reference) || null

    if (!patientReference) {
        throw Error(`Patient reference not found for Linkage ${linkage.id}`)
    }

    return patientReference
}

class RegisterPatientConsumer {
    /**
     * @param {PixDataProvider} pixDataProvider
     * @param {JobProducerProvider} jobProducerProvider
     * @param {PatientCacheProvider} patientCache
     * @param {*} logger
     */
    constructor(pixDataProvider, jobProducerProvider, patientCache, logger, configuration, fhirDataProvider) {
        this.pixDataProvider = pixDataProvider
        this.fhirDataProvider = fhirDataProvider
        this.jobProducerProvider = jobProducerProvider
        this.patientCache = patientCache
        this.logger = logger
        this.configuration = configuration
        this.consume = this.consume.bind(this)
    }

    error(message) {
        const { content } = message

        const payload = JSON.parse(content.toString())

        this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.NotFound)
    }

    async rebuildLinkage(nhsNumber) {
        const linkagesWithPatients = await this.fhirDataProvider.search(
            "Linkage",
            { author: this.configuration.orgReference, _include: "Linkage:source" },
            nhsNumber
        )

        const bundle = linkagesWithPatients

        const patientEntry = bundle.entry.find((e) => {
            return e.resource.identifier && e.resource.identifier.some((id) => id.value === nhsNumber)
        })

        if (!patientEntry) {
            throw Error("No patient entries")
        }

        const patientReference = patientEntry.fullUrl

        if (!patientReference) {
            throw Error("Linkage patient not found")
        }

        const linkageEntry = bundle.entry.find((e) => {
            return e.resource.resourceType === "Linkage" && getReferenceFromLinkage(e.resource) === patientReference
        })

        if (!linkageEntry) {
            throw Error("Linkage not found for patient")
        }

        return linkageEntry.resource
    }

    /**
     *
     * @param {import("amqplib").ConsumeMessage} message
     */
    async consume(message) {
        try {
            console.log(message)

            const { content } = message

            const payload = JSON.parse(content.toString())

            if (!payload.token) {
                throw Error(`Message payload is missing token`)
            }

            if (!payload.nhsNumber) {
                throw Error(`Message payload is missing NHS number`)
            }

            console.log(`Registering patient: ${payload.nhsNumber}`)

            // check if we already have linkage for
            const linkage = await this.patientCache.getPatientLinkage(payload.nhsNumber)

            if (linkage) {
                const patientReference = getReferenceFromLinkage(/** @type {fhir.Linkage} */ (linkage))

                this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.Registered)

                const lookupPatientProducer = this.jobProducerProvider.getJobProducer(JobType.LookupPatientJob)

                lookupPatientProducer.addJob(JobType.LookupPatientJob, {
                    nhsNumber: payload.nhsNumber,
                    reference: patientReference,
                })

                return {
                    success: true,
                }
            }

            const requestDetails = {
                auth: {
                    bearer: payload.token,
                },
            }

            if (this.configuration.mock) {
                requestDetails.body = JSON.stringify({ nhsNumber: payload.nhsNumber })
                requestDetails.headers = { "Content-Type": "application/json" }
                requestDetails.method = "POST"
            }

            const patientDetails = await request(this.configuration.host, requestDetails)

            const { family_name, given_name, nhs_number, birthdate } = JSON.parse(patientDetails)

            /** @type {fhir.Patient} */
            const pixPatient = {
                id: uuid.v4(),
                resourceType: "Patient",
                identifier: [
                    {
                        extension: [
                            {
                                url:
                                    "https://fhir.hl7.org.uk/STU3/StructureDefinition/Extension-CareConnect-NHSNumberVerificationStatus-1",
                                valueCodeableConcept: {
                                    coding: [
                                        {
                                            system:
                                                "https://fhir.hl7.org.uk/STU3/CodeSystem/CareConnect-NHSNumberVerificationStatus-1",
                                            code: "03",
                                            display: "Number requires tracing.",
                                        },
                                    ],
                                },
                            },
                        ],
                        system: "https://fhir.nhs.uk/Id/nhs-number",
                        value: nhs_number,
                    },
                ],
                active: true,
                name: [
                    {
                        family: family_name,
                        given: [given_name],
                    },
                ],
                birthDate: birthdate,
            }

            const response = await this.pixDataProvider.create(pixPatient.resourceType, pixPatient, nhs_number)

            const body = JSON.parse(response.body)

            let result

            if (body.resourceType !== "Linkage") {
                result = await this.rebuildLinkage(nhs_number)
            } else {
                result = /** @type {fhir.Linkage} */ (body)
            }

            const patientReference = getReferenceFromLinkage(/** @type {fhir.Linkage} */ (result))

            this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.Registered)
            this.patientCache.setPatientLinkage(payload.nhsNumber, result)

            const lookupPatientProducer = this.jobProducerProvider.getJobProducer(JobType.LookupPatientJob)

            lookupPatientProducer.addJob(JobType.LookupPatientJob, {
                nhsNumber: payload.nhsNumber,
                reference: patientReference,
            })

            console.log(`Registered patient: ${payload.nhsNumber}`)

            return {
                success: true,
            }
        } catch (error) {
            this.logger.error(error.message, { stack: error.stack })

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

                    if (count <= 20) {
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
            this.logger.error(error.message, error.stack)
        }
    }

    async getQueue(jobType) {
        const queueConnection = await amqplib.connect(this.configuration)

        const channel = await queueConnection.createChannel()

        await channel.assertQueue(jobType)

        return channel
    }

    async getDelayExchange(jobType) {
        const queueConnection = await amqplib.connect(this.configuration)

        const channel = await queueConnection.createChannel()

        await channel.assertExchange(jobType, "x-delayed-message", { arguments: { "x-delayed-type": "direct" } })
        await channel.assertQueue(jobType)

        await channel.bindQueue(jobType, jobType, jobType)

        return channel
    }

    async getExchange(exchange) {
        const queueConnection = await amqplib.connect(this.configuration)

        const channel = await queueConnection.createChannel()

        await channel.assertExchange(exchange, "direct")
        await channel.assertQueue(exchange)

        await channel.bindQueue(exchange, exchange, exchange)

        return channel
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
        adminFhirDataProvider
    ) {
        this.configuration = configuration
        this.pixDataProvider = pixDataProvider
        this.fhirDataProvider = fhirDataProvider
        this.cacher = cacher
        this.logger = logger
        this.jobProducerProvider = jobProducerProvider
        this.adminFhirDataProvider = adminFhirDataProvider
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
                    this.adminFhirDataProvider
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

                return new RabbitJobConsumer(this.configuration.rabbit, jobType, lookupPatientConsumer, this.logger)
            }
            default: {
                throw Error(`Job type ${jobType} does not exist`)
            }
        }
    }
}

module.exports = { JobConsumerProvider }
