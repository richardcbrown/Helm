const TokenProvider = require("../providers/token.provider")

const AuthProvider = require("../providers/auth.provider")

const PixDataProvider = require("../providers/pix.dataprovider")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")

const amqplib = require("amqplib")
const request = require("request-promise-native")
const uuid = require("uuid")

const { JobType } = require("./jobproducer.provider")

class PendingPatientConsumer {
    /**
     *
     * @param {PatientCacheProvider} patientCache
     * @param {*} logger
     */
    constructor(patientCache, logger) {
        this.patientCache = patientCache
        this.logger = logger
        this.consume = this.consume.bind(this)
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
                throw Error(`Message payload is missin token`)
            }

            const patientDetails = await request("https://oidc.mock.signin.nhs.uk/userinfo", {
                auth: {
                    bearer: payload.token,
                },
            })

            const { family_name, given_name, nhs_number, birthdate } = patientDetails

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

            const authProvider = new AuthProvider(this.logger)
            const tokenProvider = new TokenProvider(authProvider, this.logger)
            const pixDataProvider = new PixDataProvider(this.logger, tokenProvider)

            const result = await pixDataProvider.create(pixPatient.resourceType, pixPatient)

            this.patientCache.setPendingPatientStatus(nhs_number, PendingPatientStatus.Registered)

            return {
                success: true,
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                stack: error.stack,
            }
        }
    }
}

class RabbitJobConsumer {
    constructor(configuration, jobType, consumer) {
        this.configuration = configuration
        this.consumer = consumer
        this.jobType = jobType
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
            const result = await this.consumer(message)

            if (result.success) {
                queue.ack(message)
            } else {
                queue.reject(message, true)
            }
        } catch (error) {
            queue.reject(message, true)
        }
    }

    async getQueue(jobType) {
        const queueConnection = await amqplib.connect(this.configuration)

        const channel = await queueConnection.createChannel()

        await channel.assertQueue(jobType)

        return channel
    }
}

class JobConsumerProvider {
    constructor(configuration) {
        this.configuration = configuration
    }

    getJobConsumer(jobType) {
        switch (jobType) {
            case JobType.PendingPatientJob: {
                const pendingPatientConsumer = new PendingPatientConsumer()

                return new RabbitJobConsumer(this.configuration.rabbit, jobType, pendingPatientConsumer.consume)
            }
            default: {
                throw Error(`Job type ${jobType} does not exist`)
            }
        }
    }
}

module.exports = { JobConsumerProvider }
