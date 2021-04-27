/**
 * @param {fhir.Bundle} bundle
 * @param {string} resourceType
 * @returns {fhir.Resource[]}
 */
export function getFromBundle(bundle, resourceType) {
  const resources =
    (bundle.entry &&
      bundle.entry.map((entry) => entry.resource).filter((res) => !!res && res.resourceType === resourceType)) ||
    []

  return /** @type {fhir.Resource[]} */ (resources)
}
