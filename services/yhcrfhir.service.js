/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { getFromBundle } = require("../models/bundle.helpers")
const { MoleculerError } = require("moleculer").Errors

/**
 *
 * @param {fhir.QuestionnaireResponseItem | null} item
 */
function getAnswer(item, linkId) {
    const answerItem = item && item.item && item.item.find((item) => item.linkId === linkId)

    if (!answerItem) {
        return null
    }

    const { answer } = answerItem

    if (!answer) {
        return null
    }

    const [firstAnswer] = answer

    if (!firstAnswer) {
        return null
    }

    return firstAnswer.valueString || null
}

/**
 * @param {fhir.QuestionnaireResponse} questionnaireResponse
 */
function transformToComposition(questionnaireResponse) {
    const item1 = (questionnaireResponse.item || []).find((item) => item.linkId === "item1") || null
    const item2 = (questionnaireResponse.item || []).find((item) => item.linkId === "item2") || null
    const item3 = (questionnaireResponse.item || []).find((item) => item.linkId === "item3") || null

    const title1 = getAnswer(item1, "title1")
    const description1 = getAnswer(item1, "description1")
    const title2 = getAnswer(item2, "title2")
    const description2 = getAnswer(item2, "description2")
    const title3 = getAnswer(item3, "title3")
    const description3 = getAnswer(item3, "description3")

    const { meta } = questionnaireResponse

    const transformed = {
        resourceType: "Composition",
        id: `T3T:${questionnaireResponse.id}`,
        type: {
            coding: [
                {
                    system: "https://fhir.myhelm.org/STU3/ValueSet/phr-composition-type-1",
                    code: "T3T",
                    display: "Patient Top 3 Things",
                },
            ],
        },
        subject: questionnaireResponse.subject,
        date: questionnaireResponse.authored && new Date(questionnaireResponse.authored).toISOString(),
        title: "PHR 3 Items",
        section: [
            {
                title: title1 || null,
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
                    div: description1 || null,
                },
            },
            {
                title: title2 || null,
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
                    div: description2 || null,
                },
            },
            {
                title: title3 || null,
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
                    div: description3 || null,
                },
            },
        ],
        meta,
    }

    return transformed
}

/**
 * @param {fhir.Resource[]} resources
 * @returns {fhir.Bundle}
 */
function makeBundle(resources) {
    /** @type {fhir.Bundle} */
    const bundle = {
        type: "searchset",
        entry: resources.map((res) => {
            /** @type {fhir.BundleEntry} */
            const entry = {
                search: {
                    mode: "match",
                },
                resource: res,
            }

            return entry
        }),
    }

    return bundle
}

/**
 * @this {Service}
 * @param {Context} ctx
 */
async function topThreeThingsCompositionSearchHandler(ctx) {
    const { type, subject, patient } = ctx.params.query

    if (type !== "https://fhir.myhelm.org/STU3/ValueSet/phr-composition-type-1|T3T") {
        return ctx.call("internalfhirservice.search", { ...ctx.params, resourceType: "Composition" })
    }

    const questionnaireBundle = await ctx.call("internalfhirservice.search", {
        resourceType: "Questionnaire",
        identifier: "http://test.com|test",
    })

    const questionnaire = getFromBundle(questionnaireBundle, "Questionnaire")[0]

    if (!questionnaire) {
        throw new MoleculerError("T3T questionnaire not found", 500)
    }

    const query = {}

    if (subject) {
        query.subject = subject
    }

    if (patient) {
        query.patient = patient
    }

    query.questionnaire = `${questionnaire.resourceType}/${questionnaire.id}`

    const questionnaireResponseBundle = await ctx.call("internalfhirservice.search", {
        query,
        resourceType: "QuestionnaireResponse",
    })

    const questionnaireResponses = getFromBundle(questionnaireResponseBundle, "QuestionnaireResponse")

    const compositions = questionnaireResponses.map(transformToComposition)

    return makeBundle(compositions)
}

/**
 * @this {Service}
 * @param {Context} ctx
 */
async function topThreeThingsCompositionReadHandler(ctx) {
    const { resourceId } = /** @type {{ resourceId: string }} */ (ctx.params)

    if (!resourceId.startsWith("T3T:")) {
        return ctx.call("internalfhirservice.read", { ...ctx.params })
    }

    const questionnaireResponse = await ctx.call("internalfhirservice.read", {
        resourceType: "QuestionnaireResponse",
        resourceId: resourceId.replace("T3T:", ""),
    })

    if (!questionnaireResponse) {
        return null
    }

    return transformToComposition(questionnaireResponse)
}

/**
 * @this {Service}
 * @param {Context} ctx
 */
async function auditEventSearchHandler(ctx) {
    const nhsNumber = ctx.meta.user.sub

    return ctx.call("internalfhirservice.search", { ...ctx.params, resourceType: "AuditEvent" })
}

/**
 * @this {Service}
 * @param {Context} ctx
 */
async function auditEventReadHandler(ctx) {
    const nhsNumber = ctx.meta.user.sub

    return ctx.call("internalfhirservice.read", { ...ctx.params, resourceType: "AuditEvent" })
}

/** @type {ServiceSchema} */
const DemographicsService = {
    name: "yhcrfhirservice",
    actions: {
        topThreeThingsCompositionSearch: {
            handler: topThreeThingsCompositionSearchHandler,
        },
        topThreeThingsCompositionRead: {
            handler: topThreeThingsCompositionReadHandler,
        },
        auditEventSearch: {
            handler: auditEventSearchHandler,
        },
        auditEventRead: {
            handler: auditEventReadHandler,
        },
    },
}

module.exports = DemographicsService
