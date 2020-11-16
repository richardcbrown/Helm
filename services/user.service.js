/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const pg = require("pg")

const UserDataClient = require("../clients/user.dataclient")
const UserGenerator = require("../generators/user.generator")
const TokenDataClient = require("../clients/token.dataclient")
const moment = require("moment")
const { getFromBundle } = require("../models/bundle.helpers")
const getDatabaseConfiguration = require("../config/config.database")

/** @type {ServiceSchema} */
const UserService = {
    name: "userservice",
    actions: {
        createUser: {
            async handler(ctx) {
                const { nhsNumber, reference, jti } = ctx.params

                const userDataClient = new UserDataClient(this.connectionPool)
                const userGenerator = new UserGenerator(userDataClient)
                const tokenDataClient = new TokenDataClient(this.connectionPool)

                const user = await userGenerator.generateUser(nhsNumber, reference)

                const { lastLogin } = user

                const existing = await tokenDataClient.linkUserToToken(user.id, jti)

                await userDataClient.setLogin(user.id, new Date())

                if (!existing) {
                    ctx.call("metricsservice.newSession", { sessionId: jti, userId: user.id })
                }

                const lastLoginDuration = lastLogin ? moment.duration(moment(moment.now()).diff(lastLogin)) : null

                if (lastLoginDuration) {
                    ctx.call("metricsservice.lastLoginDuration", {
                        sessionId: jti,
                        userId: user.id,
                        duration: lastLoginDuration.asSeconds(),
                    })
                }

                ctx.call("metricsservice.updateMetrics")

                ctx.call("userservice.linkTopThreeThings")
            },
        },
        getUser: {
            async handler(ctx) {
                const { userId } = ctx.params

                const userDataClient = new UserDataClient(this.connectionPool)

                const user = await userDataClient.getUserById(userId)

                if (!user) {
                    throw Error(`User ${userId} does not exist`)
                }

                if (!user.nhsNumber) {
                    throw Error(`User ${userId} has no NHS number`)
                }

                const questionnaireBundle = /** @type {fhir.Bundle} */ (await ctx.call("internalfhirservice.search", {
                    resourceType: "Questionnaire",
                    query: { identifier: "http://test.com|test" },
                }))

                const questionnaires = /** @type {fhir.QuestionnaireResponse[]} */ (getFromBundle(
                    questionnaireBundle,
                    "Questionnaire"
                ))

                const questionnaire = questionnaires[0]

                if (!questionnaire) {
                    throw Error("T3T questionnaire not found")
                }

                const topThreeThingsBundle = /** @type {fhir.Bundle} */ (await ctx.call("internalfhirservice.search", {
                    resourceType: "QuestionnaireResponse",
                    query: {
                        "patient.identifier": `https://fhir.nhs.uk/Id/nhs-number|${user.nhsNumber}`,
                        questionnaire: `${questionnaire.resourceType}/${questionnaire.id}`,
                    },
                }))

                let questionnaireResponses = /** @type {fhir.QuestionnaireResponse[]} */ (getFromBundle(
                    topThreeThingsBundle,
                    "QuestionnaireResponse"
                ))

                // filter entries that already have references set
                questionnaireResponses = questionnaireResponses.filter((qr) => {
                    const { author = {}, subject = {}, source = {} } = qr

                    return !author.reference || !subject.reference || !source.reference
                })

                questionnaireResponses.forEach((qr) => {
                    qr.author = qr.author || {}
                    qr.author.reference = user.reference
                    qr.subject = qr.subject || {}
                    qr.subject.reference = user.reference
                    qr.source = qr.source || {}
                    qr.source.reference = user.reference
                })

                // for (let questionnaireResponse of questionnaireResponses) {
                //     ctx.call("internalfhirservice.search", {  })
                // }
            },
        },
        linkTopThreeThings: {
            async handler(ctx) {
                const { userId } = ctx.params
            },
        },
        trackPage: {
            async handler(ctx) {
                const { jti, id } = ctx.meta.user
                const { url } = ctx.params.properties

                const tokenDataClient = new TokenDataClient(this.connectionPool)

                const token = await tokenDataClient.getToken(jti)

                if (!token) {
                    throw Error("Token not found")
                }

                const { currentPage, pageViewStart, totalPages } = token

                if (currentPage === url) {
                    return
                }

                const pageDuration = pageViewStart ? moment.duration(moment(moment.now()).diff(pageViewStart)) : null

                ctx.call("metricsservice.page", {
                    sessionId: jti,
                    userId: id,
                    page: url,
                })

                if (pageDuration && currentPage) {
                    await ctx.call("metricsservice.pageDuration", {
                        sessionId: jti,
                        userId: id,
                        page: currentPage,
                        duration: pageDuration.asSeconds(),
                    })
                }

                await tokenDataClient.trackSessionPage(url, totalPages + 1, new Date(), jti)
            },
        },
    },
    async started() {
        const config = await getDatabaseConfiguration()

        this.connectionPool = new pg.Pool(config)
    },
}

module.exports = UserService
