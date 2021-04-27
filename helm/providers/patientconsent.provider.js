/** @typedef {import("moleculer").Context<any, any>} Context */
/** @typedef {import("../config/types").ConsentConfiguration} ConsentConfig */

const { ResourceType } = require("../models/resourcetype.enum")
const { getFromBundle } = require("../models/bundle.helpers")
const { makeReference } = require("../models/resource.helpers")

const { getPatientByNhsNumber, getPolicies } = require("../requestutilities/fhirrequest.utilities")
const { MoleculerError } = require("moleculer").Errors
const { PatientCacheProvider } = require("../providers/patientcache.provider")

class PatientConsentProvider {
    /**
     * @param {Context} ctx
     * @param {ConsentConfig} configuration
     * @param {PatientCacheProvider} cacheProvider
     */
    constructor(ctx, configuration, cacheProvider) {
        /**
         * @private
         */
        this.ctx = ctx

        /**
         * @private
         */
        this.configuration = configuration

        /**
         * @private
         */
        this.cacheProvider = cacheProvider
    }

    /**
     * Checks if patient has consented to site terms
     * @public
     * @param {number | string} nhsNumber
     * @returns {Promise<boolean>} whether patient has consented or not
     */
    async patientHasConsented(nhsNumber) {
        const consented = await this.cacheProvider.getPatientConsented(nhsNumber)

        if (consented) {
            return true
        }

        const patient = await getPatientByNhsNumber(nhsNumber, this.ctx)

        const patientReference = makeReference(patient)

        const policiesPromise = this.getPolicies()
        const consentPromise = this.getConsent(patientReference)

        const [policies, consents] = await Promise.all([policiesPromise, consentPromise])

        const hasConsented = this.matchPoliciesToConsents(policies, /** @type {fhir.Consent[]} */ (consents))

        if (hasConsented) {
            this.cacheProvider.setPatientConsented(nhsNumber)
        }

        return hasConsented
    }

    /**
     * get policies
     * @public
     * @returns {Promise<fhir.Resource[]>} policy resources
     */
    async getPolicies() {
        const { policyNames, policyFriendlyNames } = this.configuration

        const policiesEntries = await getPolicies(policyNames, this.ctx)

        const policies = /** @type {fhir.Resource[]} */ (policiesEntries.map((policy) => policy.resource))

        policyNames.forEach((pn, index) => {
            const policy = policies.find((policy) => policy.name === pn)

            if (!policy) {
                throw new MoleculerError("Mismatched Policies", 400)
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
        const consentBundle = await this.ctx.call("internalfhirservice.search", {
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

            return consents.some((consent) =>
                (consent.policy || []).some((cp) => cp.uri && cp.uri.includes(policyReference))
            )
        })
    }
}

module.exports = PatientConsentProvider
