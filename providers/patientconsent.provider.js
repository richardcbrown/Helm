/** @typedef {import("moleculer").Context<any, any>} Context */
/** @typedef {import("../config/types").ConsentConfiguration} ConsentConfig */

const { ResourceType } = require("../models/resourcetype.enum")
const { getFromBundle } = require("../models/bundle.helpers")
const { makeReference } = require("../models/resource.helpers")

const { getPatientByNhsNumber, getPolicies } = require("../requestutilities/fhirrequest.utilities")

class PatientConsentProvider {
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
     * Checks if patient has consented to site terms
     * @public
     * @param {number | string} nhsNumber
     * @returns {Promise<boolean>} whether patient has consented or not
     */
    async patientHasConsented(nhsNumber) {
        const patient = await getPatientByNhsNumber(nhsNumber, this.ctx)

        const patientReference = makeReference(patient)

        const policiesPromise = this.getPolicies()
        const consentPromise = this.getConsent(patientReference)

        const [policies, consents] = await Promise.all([policiesPromise, consentPromise])

        return this.matchPoliciesToConsents(policies, /** @type {fhir.Consent[]} */ (consents))
    }

    /**
     * get policies
     * @public
     * @returns {Promise<fhir.Resource[]>} policy resources
     */
    async getPolicies() {
        const { policyNames, policyFriendlyNames } = this.configuration

        const policies = await getPolicies(policyNames, this.ctx)

        policyNames.forEach((pn, index) => {
            const policy = policies.find((policy) => policy.name === pn)

            if (!policy) {
                throw Error("Mismatched Policies")
            }

            const policyFriendlyName = policyFriendlyNames[index]

            policy.name = policyFriendlyName || policy.name
        })

        return policies
    }

    /**
     * get consent
     * @private
     * @param {string} reference the reference of the consentor to search for
     * @returns {Promise<fhir.Consent[]>} consent resources
     */
    async getConsent(reference) {
        const consentBundle = await this.ctx.call("fhirservice.search", {
            resourceType: ResourceType.Consent,
            query: { consentor: reference },
        })

        const consent = /** @type {fhir.Consent[]} */ (getFromBundle(consentBundle, ResourceType.Consent))

        return consent
    }

    /**
     * Checks if all policies have a matching consent
     * @private
     * @param {fhir.Resource[]} policies patient policies to match
     * @param {fhir.Consent[]} consents patient consents to match
     * @returns {boolean} true if the patient has consented to all policies, otherwise false
     */
    matchPoliciesToConsents(policies, consents) {
        return policies.every((policy) => {
            const policyReference = makeReference(policy)

            return consents.some((consent) => consent.policyRule === policyReference)
        })
    }
}

module.exports = PatientConsentProvider