/**
 *
 * @param {fhir.CodeableConcept | fhir.Coding[] | fhir.Coding | null} coding
 * @returns {fhir.Coding[]}
 */
const flattenCoding = (coding) => {
    /** @type {fhir.Coding[]} */
    let flattened = []

    if (!coding) {
        return flattened
    }

    // fhir.Coding[]
    if (Array.isArray(coding)) {
        flattened = [...coding]
    } else if (coding.coding) {
        const codes = coding.coding || []

        flattened = [...codes]
    } else {
        flattened = [coding]
    }

    return flattened
}

/**
 * @param {fhir.CodeableConcept | fhir.Coding[] | fhir.Coding | null} coding
 * @param {fhir.CodeableConcept | fhir.Coding[] | fhir.Coding | null} targetCoding
 * @returns {boolean}
 */
const matchCoding = (coding, targetCoding) => {
    if (!coding || !targetCoding) {
        return false
    }

    const base = flattenCoding(coding)
    const target = flattenCoding(targetCoding)

    if (!base.length) {
        throw Error("No coding provided to compare")
    }

    if (!target.length) {
        throw Error("No coding to compare to")
    }

    return target.some((searchCode) => {
        return !!base.find((c) => c.code === searchCode.code && c.system === searchCode.system)
    })
}

module.exports = { matchCoding, flattenCoding }
