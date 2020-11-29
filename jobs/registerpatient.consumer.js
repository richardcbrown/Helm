const request = require("request-promise-native")
const { PatientCacheProvider, PendingPatientStatus } = require("../providers/patientcache.provider")
const { JobProducerProvider } = require("./jobproducer.provider")
const PixDataProvider = require("../providers/pix.dataprovider")
const { JobType } = require("./jobproducer.provider")
const { getFromBundle } = require("../models/bundle.helpers")

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
    constructor(
        pixDataProvider,
        jobProducerProvider,
        patientCache,
        logger,
        configuration,
        fhirDataProvider,
        internalFhirDataProvider
    ) {
        this.pixDataProvider = pixDataProvider
        this.fhirDataProvider = fhirDataProvider
        this.jobProducerProvider = jobProducerProvider
        this.patientCache = patientCache
        this.logger = logger
        this.configuration = configuration
        this.internalFhirDataProvider = internalFhirDataProvider
        this.consume = this.consume.bind(this)
    }

    error(message) {
        const { content } = message

        const payload = JSON.parse(content.toString())

        this.patientCache.setPendingPatientStatus(payload.nhsNumber, PendingPatientStatus.NotFound)
    }

    /**
     * @param {fhir.Linkage} linkage
     */
    async deleteInactiveLinkage(linkage) {
        const { id, resourceType } = linkage

        await this.pixDataProvider.remove(resourceType, id, null)
    }

    /**
     * @param {fhir.Linkage} linkage
     */
    isInactiveLinkage(linkage, id) {
        const { item = [] } = linkage

        const currentProviderItem = item.find(
            (itm) =>
                itm.type === "alternate" &&
                itm.resource &&
                itm.resource.reference &&
                itm.resource.reference.includes(id)
        )

        return !!!currentProviderItem
    }

    async rebuildLinkage(nhsNumber) {
        /** @type {fhir.Bundle} */
        const patients = await this.fhirDataProvider.search(
            "Patient",
            { identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}` },
            nhsNumber
        )

        const { entry } = patients

        if (!entry || !entry.length) {
            throw Error(`No Patient results for ${nhsNumber}`)
        }

        const patientEntry = entry.find((e) => e.resource && e.resource.resourceType === "Patient")

        if (!patientEntry) {
            throw Error(`No Patient resource for ${nhsNumber}`)
        }

        const linkages = await this.fhirDataProvider.search(
            "Linkage",
            { source: patientEntry.fullUrl, author: this.configuration.orgReference },
            nhsNumber
        )

        console.log(linkages)

        const linkageEntries = linkages.entry

        if (!linkageEntries || !linkageEntries) {
            throw Error(`No Linkage results for ${nhsNumber}`)
        }

        const linkageEntry = linkageEntries.find((e) => e.resource && e.resource.resourceType === "Linkage")

        if (!linkageEntry) {
            throw Error(`No Linkage resource for ${nhsNumber}`)
        }

        this.patientCache.setPatientLinkage(nhsNumber, linkageEntry.resource)
    }

    async lookupInternalPatient(nhsNumber) {
        const patientBundle = await this.internalFhirDataProvider.search(
            "Patient",
            { identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}` },
            nhsNumber
        )

        const [patient] = await getFromBundle(patientBundle, "Patient")

        if (patient) {
            return patient
        }

        // setup a stub patient to be populated
        const createdPatient = await this.internalFhirDataProvider.create(
            "Patient",
            {
                resourceType: "Patient",
                identifier: [{ system: "https://fhir.nhs.uk/Id/nhs-number", value: nhsNumber }],
            },
            null
        )

        return JSON.parse(createdPatient.body)
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
            const linkage = null //await this.patientCache.getPatientLinkage(payload.nhsNumber)

            console.log(linkage)

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

            console.log(this.configuration)

            if (this.configuration.mock) {
                requestDetails.body = JSON.stringify({ nhsNumber: payload.nhsNumber })
                requestDetails.headers = { "Content-Type": "application/json" }
                requestDetails.method = "POST"
            }

            const patientDetails = await request(this.configuration.host, requestDetails)

            const { family_name, given_name, nhs_number, birthdate } = JSON.parse(patientDetails)

            const internalPatient = await this.lookupInternalPatient(nhs_number)

            /** @type {fhir.Patient} */
            const pixPatient = {
                id: internalPatient.id,
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
                console.log("Rebuilding Linkag")

                await this.rebuildLinkage(nhs_number)

                console.log("Linkage rebuild")

                result = await this.patientCache.getPatientLinkage(nhs_number)

                if (!result) {
                    throw Error(`Patient ${nhs_number} not found after Linkage rebuild`)
                }
            } else {
                result = /** @type {fhir.Linkage} */ (body)
            }

            if (this.isInactiveLinkage(result, internalPatient.id)) {
                await this.deleteInactiveLinkage(result)

                return {
                    success: false,
                    retry: true,
                }
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

module.exports = RegisterPatientConsumer
