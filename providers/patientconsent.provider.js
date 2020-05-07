/** @typedef {import("moleculer").Context<any, any>} Context */
/** @typedef {import("../config/types").ConsentConfiguration} ConsentConfig */

const { ResourceType } = require("../models/resourcetype.enum")
const { getFromBundle } = require("../models/bundle.helpers")
const { makeReference } = require("../models/resource.helpers")

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
        const patient = await this.getPatient(nhsNumber)

        const patientReference = makeReference(patient)

        const policiesPromise = this.getPolicies()
        const consentPromise = this.getConsent(patientReference)

        const [policies, consents] = await Promise.all([policiesPromise, consentPromise])

        return this.matchPoliciesToConsents(policies, /** @type {fhir.Consent[]} */ (consents))
    }

    /**
     * @private
     * @param {number | string} nhsNumber
     * @returns {Promise<fhir.Patient>} the patient
     */
    async getPatient(nhsNumber) {
        /** @type {fhir.Bundle} */
        const patientsBundle = await this.ctx.call("fhirservice.search", {
            resourceType: ResourceType.Patient,
            query: { identifier: nhsNumber },
        })

        const patients = /** @type {fhir.Patient[]} */ (getFromBundle(patientsBundle, ResourceType.Patient))

        if (!patients.length) {
            throw Error("Patient not found")
        }

        return patients[0]
    }

    /**
     * get policies
     * @private
     * @returns {Promise<fhir.Resource[]>} policy resources
     */
    async getPolicies() {
        const { policyNames } = this.configuration

        const policyBundle = await this.ctx.call("fhirservice.search", {
            resourceType: ResourceType.Policy,
            query: { "name:exact": policyNames.join(",") },
        })

        const policies = /** @type {fhir.Resource[]} */ (getFromBundle(policyBundle, ResourceType.Policy))

        if (!policies.length) {
            throw Error("Site policies have not been set")
        }

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
