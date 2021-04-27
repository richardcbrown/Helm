const FhirStoreDataProvider = require("../providers/fhirstore.dataprovider")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const { JobProducerProvider } = require("./jobproducer.provider")

const { matchCoding } = require("../models/coding.helpers")

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
    constructor(jobProducerProvider, patientCache, logger, fhirDataProvider, configuration) {
        this.jobProducerProvider = jobProducerProvider
        this.patientCache = patientCache
        this.logger = logger
        this.fhirDataProvider = fhirDataProvider
        this.configuration = configuration
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
                const retries = message.properties.headers["x-retry-count"]

                const count = Number(retries) || 1

                // max retries reached
                // fallback to partial resolution
                if (count >= this.configuration.retryCount && isPartiallyResolved(patient)) {
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

module.exports = LookupPatientConsumer
