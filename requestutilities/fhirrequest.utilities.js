/** @typedef {import("moleculer").Context<any, any>} Context */

const { ResourceType } = require("../models/resourcetype.enum")
const { getFromBundle, getEntriesFromBundle } = require("../models/bundle.helpers")

/**
 * get policies
 * @param {Context} ctx
 * @param {Array<string>} policyNames
 * @returns {Promise<fhir.BundleEntry[]>} policy resources
 */
const getPolicies = async (policyNames, ctx) => {
    const policyBundle = await ctx.call("fhirservice.search", {
        resourceType: ResourceType.Policy,
        query: { "name:exact": policyNames.join(",") },
    })

    const policies = /** @type {fhir.BundleEntry[]} */ (getEntriesFromBundle(policyBundle, ResourceType.Policy))

    if (!policies.length) {
        throw Error("Site policies have not been set")
    }

    return policies
}

/**
 * @param {number | string} nhsNumber
 * @param {Context} ctx
 * @returns {Promise<fhir.Patient>} the patient
 */
const getPatientByNhsNumber = async (nhsNumber, ctx) => {
    /** @type {fhir.Bundle} */
    const patientsBundle = await ctx.call("fhirservice.search", {
        resourceType: ResourceType.Patient,
        query: { identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}` },
    })

    const patients = /** @type {fhir.Patient[]} */ (getFromBundle(patientsBundle, ResourceType.Patient))

    if (!patients.length) {
        throw Error("Patient not found")
    }

    return patients[0]
}

/**
 * @param {number | string} nhsNumber
 * @param {Context} ctx
 * @returns {Promise<fhir.BundleEntry>} the patient bundle entry
 */
const getPatientEntryByNhsNumber = async (nhsNumber, ctx) => {
    /** @type {fhir.Bundle} */
    const patientsBundle = await ctx.call("fhirservice.search", {
        resourceType: ResourceType.Patient,
        query: { identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}` },
    })

    const entries = getEntriesFromBundle(patientsBundle, ResourceType.Patient)

    if (!entries.length) {
        throw Error("Patient bundle entry not found")
    }

    return entries[0]
}

/**
 * Request creation of fhir resource
 * @param {fhir.Resource} resource
 * @param {Context} ctx
 * @returns {Promise<void>}
 */
const createResource = async (resource, ctx) => {
    await ctx.call("fhirservice.create", { resource, resourceType: resource.resourceType })
}

module.exports = { getPolicies, getPatientByNhsNumber, createResource, getPatientEntryByNhsNumber }
