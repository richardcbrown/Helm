/** @typedef {import("moleculer").Context<any, any>} Context */
/** @typedef {import("../config/types").ConsentConfiguration} ConsentConfig */

const { ResourceType } = require("../models/resourcetype.enum")
const { makeReference } = require("../models/resource.helpers")
const { getPatientByNhsNumber, getPolicies, createResource } = require("../requestutilities/fhirrequest.utilities")
const { MoleculerError } = require("moleculer").Errors

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

        const sitePoliciesEntries = await getPolicies(policyNames, this.ctx)

        const sitePolicies = /** @type {fhir.Resource[]} */ (sitePoliciesEntries.map((spe) => spe.resource))

        if (policies.length !== sitePolicies.length) {
            throw new MoleculerError("Not all site policies are being consented to", 400)
        }

        if (!this.matchPolicies(policies, sitePolicies)) {
            throw new MoleculerError("Policies being consented to do not match site policies", 400)
        }

        /** @type {fhir.Consent[]} */
        const consents = []

        const patientReference = makeReference(patient)

        sitePoliciesEntries.forEach((sitePolicy) => {
            const policyReference = sitePolicy.fullUrl

            consents.push({
                resourceType: ResourceType.Consent,
                policy: [{ uri: policyReference }],
                patient: { reference: patientReference },
                status: "active",
                consentingParty: [
                    {
                        reference: patientReference,
                    },
                ],
            })
        })

        /** @type {Array<Promise<void>>} */
        const createPromises = []

        consents.forEach((consent) =>
            createPromises.push(
                this.ctx.call("internalfhirservice.create", { resource: consent, resourceType: consent.resourceType })
            )
        )

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
