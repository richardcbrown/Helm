/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const fhirservice = require("./fhir.service")
const { searchActionHandler, readActionHandler, createActionHandler } = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.internalfhirstore")
const EmptyAuthProvider = require("../providers/fhirstore.emptyauthprovider")

/**
 * @typedef {Object} PatientFhirResourceConfig
 * @property {Array<string>} allowedResources
 * @property {string} patientIdentifierSystem
 */

/**
 * @typedef {Object} ResourceWithSubject
 * @property {fhir.Reference} [subject]
 */

/**
 * Checks two FHIR identifiers match
 * @param {fhir.Identifier} sourceIdentifier
 * @param {fhir.Identifier} targetIdentifier
 * @returns {boolean}
 */
function matchIdentifier(sourceIdentifier, targetIdentifier) {
    return !!(
        sourceIdentifier.system &&
        targetIdentifier.value &&
        sourceIdentifier.system === targetIdentifier.system &&
        sourceIdentifier.value === targetIdentifier.value
    )
}

/**
 * @typedef {Object} PatientResourceChecker
 * @property {(resource: fhir.Resource & ResourceWithSubject, identifier: fhir.Identifier) => boolean} isAccessibleResource
 * @property {(resource: fhir.Resource & ResourceWithSubject, identifier: fhir.Identifier) => fhir.Resource & ResourceWithSubject} setAsPatientResource
 * @property {(params: any, identifier: fhir.Identifier) => any} applyIdentifierToSearch
 */

/** @type {PatientResourceChecker} */
class PatientSubjectResourceChecker {
    /**
     * @param {fhir.Resource & ResourceWithSubject} resource
     * @param {fhir.Identifier} patientIdentifier
     * @returns {boolean}
     */
    isAccessibleResource(resource, patientIdentifier) {
        // resource has no subject
        if (!resource.subject) {
            throw Error(`Resource ${resource.resourceType} has no subject`)
        }

        const { subject } = resource

        const { identifier, reference } = subject

        // check the identifier
        if (identifier) {
            return matchIdentifier(identifier, patientIdentifier)
        }

        // return false
        return false
    }

    /**
     * @param {fhir.Resource & ResourceWithSubject} resource
     * @param {fhir.Identifier} patientIdentifier
     * @returns {fhir.Resource & ResourceWithSubject}
     */
    setAsPatientResource(resource, patientIdentifier) {
        resource.subject = {
            reference: "Patient/1234",
            identifier: patientIdentifier,
        }

        return resource
    }

    applyIdentifierToSearch(params, patientIdentifier) {
        params.subject = `Patient/1234`

        return params
    }
}

class PatientFhirResourceChecker {
    /**
     * @param {PatientFhirResourceConfig} configuration
     * @param {{ [resourceType: string]: PatientResourceChecker }} resourceCheckers
     */
    constructor(configuration, resourceCheckers) {
        this.configuration = configuration
        this.resourceCheckers = resourceCheckers
    }

    /**
     * @param {Context} ctx
     * @returns {fhir.Identifier}
     */
    identifierFromContext(ctx) {
        return {
            system: this.configuration.patientIdentifierSystem,
            value: ctx.meta.user.sub,
        }
    }

    /**
     * Checks if patient is allowed to interact with the resource
     * @public
     * @param {string} resourceType
     * @returns {boolean}
     */
    isAllowedResource(resourceType) {
        const { allowedResources } = this.configuration

        return allowedResources.some((allowedResource) => allowedResource === resourceType)
    }

    isAccessibleResource(resource, patientIdentifier) {
        // is the resource type allowed to patients?
        if (!this.isAllowedResource(resource.resourceType)) {
            return false
        }

        const resourceChecker = this.getResourceChecker(resource.resourceType)

        return resourceChecker.isAccessibleResource(resource, patientIdentifier)
    }

    setAsPatientResource(resource, patientIdentifier) {
        const checker = this.getResourceChecker(resource.resourceType)

        return checker.setAsPatientResource(resource, patientIdentifier)
    }

    /**
     *
     * @param {fhir.Bundle} bundle
     */
    checkBundle(bundle, patientIdentifier) {
        if (bundle.entry) {
            bundle.entry = bundle.entry.filter((entry) => {
                if (!entry.resource) {
                    return true
                } else {
                    return this.isAccessibleResource(entry.resource, patientIdentifier)
                }
            })
        }

        return bundle
    }

    applyIdentifierToSearch(params, patientIdentifier) {
        if (!params.resourceType) {
            throw Error("No resourceType found in params")
        }

        const checker = this.getResourceChecker(params.resourceType)

        return checker.applyIdentifierToSearch(params, patientIdentifier)
    }

    checkResource(resource, patientIdentifier) {
        if (!this.isAccessibleResource(resource, patientIdentifier)) {
            return null
        }

        return resource
    }

    getResourceChecker(resourceType) {
        const checker = this.resourceCheckers[resourceType]

        if (!checker) {
            throw Error(`No resource checker defined for resource ${resourceType}`)
        }

        return checker
    }
}

const subjectResourceChecker = new PatientSubjectResourceChecker()

const patientResourceChecker = new PatientFhirResourceChecker(
    {
        allowedResources: ["Composition"],
        patientIdentifierSystem: "https://fhir.nhs.uk/Id/nhs-number",
    },
    {
        Composition: subjectResourceChecker,
    }
)

function buildSearchQuery(params) {
    const { resourceType } = params

    delete params.resourceType

    return {
        resourceType,
        query: {
            ...params,
        },
    }
}

/** @type {ServiceSchema} */
const PatientFhirService = {
    name: "patientfhirservice",
    mixins: [fhirservice],
    methods: {
        async searchActionHandler(ctx) {
            const identifier = patientResourceChecker.identifierFromContext(ctx)

            if (!patientResourceChecker.isAllowedResource(ctx.params.resourceType)) {
                throw Error(`Attempt to access blocked resource`)
            }

            let sanitisedQuery = null

            if (ctx.params._queryId) {
                /** @todo need to check query id */
                sanitisedQuery = buildSearchQuery(ctx.params)
            } else {
                sanitisedQuery = buildSearchQuery(
                    patientResourceChecker.applyIdentifierToSearch(ctx.params, identifier)
                )
            }

            /** @type {fhir.Bundle} */
            const searchResult = await ctx.call("internalfhirservice.search", sanitisedQuery)

            return patientResourceChecker.checkBundle(searchResult, identifier)
        },
        async readActionHandler(ctx) {
            const identifier = patientResourceChecker.identifierFromContext(ctx)

            if (!patientResourceChecker.isAllowedResource(ctx.params.resourceType)) {
                throw Error(`Attempt to access blocked resource`)
            }

            /** @type {fhir.Resource} */
            const searchResult = await ctx.call("internalfhirservice.read", ctx.params)

            return patientResourceChecker.checkResource(searchResult, identifier)
        },
        async createActionHandler(ctx) {
            const identifier = patientResourceChecker.identifierFromContext(ctx)

            if (!patientResourceChecker.isAllowedResource(ctx.params.resourceType)) {
                throw Error(`Attempt to create blocked resource`)
            }

            let { resource } = ctx.params

            if (!resource) {
                throw Error("No resource")
            }

            resource = patientResourceChecker.setAsPatientResource(resource, identifier)

            await ctx.call("internalfhirservice.create", { ...ctx.params, resource })
        },
    },
}

module.exports = PatientFhirService