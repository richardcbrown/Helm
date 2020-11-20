const { PatientCacheProvider } = require("../providers/patientcache.provider")
const { getFromBundle } = require("../models/bundle.helpers")
const { ResourceType } = require("../models/resourcetype.enum")
const { makeReference } = require("../models/resource.helpers")
const { getPatientByNhsNumber } = require("../requestutilities/fhirrequest.utilities")

class InternalPatientGenerator {
    /**
     *
     * @param {*} ctx
     * @param {PatientCacheProvider} patientCacheProvider
     */
    constructor(ctx, patientCacheProvider) {
        this.ctx = ctx
        this.patientCacheProvider = patientCacheProvider
    }

    async generateInternalPatient(nhsNumber) {
        const reference = await this.patientCacheProvider.getPatientReference(nhsNumber)

        if (reference) {
            return reference
        }

        /**
         * @type {fhir.Bundle}
         */
        const patientBundle = await this.ctx.call("internalfhirservice.search", {
            resourceType: "Patient",
            query: { identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}` },
        })

        const [patient] = getFromBundle(patientBundle, ResourceType.Patient)

        // already have patient
        if (patient) {
            this.patientCacheProvider.setPatientReference(nhsNumber, makeReference(patient))
            return
        }

        const goldenRecord = await getPatientByNhsNumber(nhsNumber, this.ctx)

        const localRecord = {
            ...goldenRecord,
        }

        delete localRecord.id

        /** @todo error handling */
        await this.ctx.call("internalfhirservice.create", { resourceType: ResourceType.Patient, resource: localRecord })

        /**
         * @type {fhir.Bundle}
         */
        const createdPatientBundle = await this.ctx.call("internalfhirservice.search", {
            resourceType: "Patient",
            query: { identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}` },
        })

        const [createdPatient] = getFromBundle(createdPatientBundle, ResourceType.Patient)

        // new patient record
        if (createdPatient) {
            const reference = makeReference(createdPatient)

            this.patientCacheProvider.setPatientReference(nhsNumber, makeReference(createdPatient))

            return reference
        }

        throw Error(`Unable to create local record for identifier ${nhsNumber}`)
    }
}

module.exports = { InternalPatientGenerator }
