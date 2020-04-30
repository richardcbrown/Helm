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

    return entry.filter((e) => e.resource && e.resource.resourceType === resourceType).map((e) => e.resource)
}

module.exports = { getFromBundle }
