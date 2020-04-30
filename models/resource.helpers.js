/** @typedef {import("./types").ReferenceComponents} ReferenceComponents */

/**
 * @param {fhir.Reference[]} references
 * @param {string} resourceType
 * @returns {string | null}
 */
function getResourceTypeReference(references, resourceType) {
    const ref = references.find((ref) => ref.reference && ref.reference.startsWith(`${resourceType}/`))

    if (!ref || !ref.reference) {
        return null
    }

    return ref.reference
}

/**
 * Splits fhir reference into components
 * @param {string} reference
 * @returns {ReferenceComponents} reference components
 */
function splitReference(reference) {
    const [resourceType, resourceId] = reference.split("/")

    return {
        resourceId,
        resourceType,
    }
}

module.exports = { getResourceTypeReference, splitReference }
