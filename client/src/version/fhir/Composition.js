/**
 *
 * @param {fhir.CodeableConcept | fhir.Coding[] | fhir.Coding | null} coding
 * @returns {fhir.Coding[]}
 */
export const flattenCoding = (coding) => {
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
export const matchCoding = (coding, targetCoding) => {
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

/**
 * @param {Array<fhir.CompositionSection>} sections
 * @param {fhir.CodeableConcept | fhir.Coding} codeableConcept
 */
export function flattenSectionByCode(sections, codeableConcept) {
  const section = sections.find((sec) => matchCoding(codeableConcept, sec.code || null))

  let flattened = {
    title: null,
    text: null,
  }

  if (!section) {
    return flattened
  }

  flattened.title = section.title || null
  flattened.text = (section.text && section.text.div) || null

  return flattened
}

/**
 * @param {fhir.Composition} composition
 */
export function flattenComposition(composition) {
  const { section, date } = composition

  if (!section) {
    return {
      name1: null,
      name2: null,
      name3: null,
      description1: null,
      description2: null,
      description3: null,
      date,
    }
  }

  const first = flattenSectionByCode(section, {
    system: "https://fhir.myhelm.org/STU3/ValueSet/phr-section-t3t-1",
    code: "3T1",
  })
  const second = flattenSectionByCode(section, {
    system: "https://fhir.myhelm.org/STU3/ValueSet/phr-section-t3t-1",
    code: "3T2",
  })
  const third = flattenSectionByCode(section, {
    system: "https://fhir.myhelm.org/STU3/ValueSet/phr-section-t3t-1",
    code: "3T3",
  })

  return {
    name1: first.title,
    name2: second.title,
    name3: third.title,
    description1: first.text,
    description2: second.text,
    description3: third.text,
  }
}

export function transformComposition(formData) {
  return {
    resourceType: "Composition",
    status: "final",
    type: {
      coding: [
        {
          system: "https://fhir.myhelm.org/STU3/ValueSet/phr-composition-type-1",
          code: "T3T",
          display: "Patient Top 3 Things",
        },
      ],
    },
    date: new Date().toISOString(),
    title: "PHR 3 Items",
    section: [
      {
        title: formData.name1 || null,
        code: {
          coding: [
            {
              system: "https://fhir.myhelm.org/STU3/ValueSet/phr-section-t3t-1",
              code: "3T1",
              display: "First of patient top 3 things",
            },
          ],
        },
        text: {
          status: "generated",
          div: formData.description1 || null,
        },
      },
      {
        title: formData.name2 || null,
        code: {
          coding: [
            {
              system: "https://fhir.myhelm.org/STU3/ValueSet/phr-section-t3t-1",
              code: "3T2",
              display: "Second of patient top 3 things",
            },
          ],
        },
        text: {
          status: "generated",
          div: formData.description2 || null,
        },
      },
      {
        title: formData.name3 || null,
        code: {
          coding: [
            {
              system: "https://fhir.myhelm.org/STU3/ValueSet/phr-section-t3t-1",
              code: "3T3",
              display: "Third of patient top 3 things",
            },
          ],
        },
        text: {
          status: "generated",
          div: formData.description3 || null,
        },
      },
    ],
  }
}
