/** @typedef {import("moleculer").Context<any, any>} Context */
/** @typedef {import("../config/types").ConsentConfiguration} ConsentConfig */

const { ResourceType } = require("../models/resourcetype.enum")
const { makeReference } = require("../models/resource.helpers")
const { getPatientByNhsNumber, getPolicies, createResource } = require("../requestutilities/fhirrequest.utilities")

class PatientConsentGenerator {
    /**
     * @param {Context} ctx
     * @param {ConsentConfig} configuration
     */
    constructor(ctx, configuration) {
        /**
         * @private
         */
        this.ctx = ctx

        /**
         * @private
         */
        this.configuration = configuration
    }

    /**
     * creates consents for policies
     * @param {number | string} nhsNumber
     * @param {fhir.Resource[]} policies
     * @returns {Promise<void>}
     */
    async generatePatientConsent(nhsNumber, policies) {
        const { policyNames } = this.configuration

        const patient = await getPatientByNhsNumber(nhsNumber, this.ctx)

        const sitePolicies = await getPolicies(policyNames, this.ctx)

        if (policies.length !== sitePolicies.length) {
            throw Error("Not all site policies are being consented to")
        }

        if (!this.matchPolicies(policies, sitePolicies)) {
            throw Error("Policies being consented to do not match site policies")
        }

        /** @type {fhir.Consent[]} */
        const consents = []

        const patientReference = makeReference(patient)

        sitePolicies.forEach((sitePolicy) => {
            const policyReference = makeReference(sitePolicy)

            consents.push({
                resourceType: ResourceType.Consent,
                policyRule: policyReference,
                patient: { reference: patientReference },
                consentingParty: [
                    {
                        reference: patientReference,
                    },
                ],
            })
        })

        /** @type {Array<Promise<void>>} */
        const createPromises = []

        consents.forEach((consent) => createPromises.push(createResource(consent, this.ctx)))

        await Promise.all(createPromises)
    }

    /**
     * Checks that policies being consented to match the site policies
     * @param {fhir.Resource[]} incomingPolicies the policies being consented to
     * @param {fhir.Resource[]} sitePolicies this actual policies of the site
     */
    matchPolicies(incomingPolicies, sitePolicies) {
        return sitePolicies.every((sitePolicy) => {
            return incomingPolicies.some((incomingPolicy) => incomingPolicy.id === sitePolicy.id)
        })
    }
}

module.exports = PatientConsentGenerator
