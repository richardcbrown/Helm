/**
 *
 * @param {fhir.Bundle} bundle
 * @param {string} resourceType
 * @returns {Array<fhir.Resource>} matching resources
 */
function getFromBundle(bundle, resourceType) {
    const { entry } = bundle

    if (!entry) {
        return []
    }

    const resources = /** @type {fhir.Resource[]} */ (entry
        .filter((e) => e.resource && e.resource.resourceType === resourceType)
        .map((e) => e.resource)
        .filter((r) => !!r))

    return resources
}

module.exports = { getFromBundle }
