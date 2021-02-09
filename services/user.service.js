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
const { MoleculerError } = require("moleculer").Errors
const { InternalPatientGenerator } = require("../generators/internalpatient.generator")
const RedisDataProvider = require("../providers/redis.dataprovider")
const getRedisConfig = require("../config/config.redis")
const { PatientCacheProvider } = require("../providers/patientcache.provider")
const getNhsLoginConfig = require("../config/config.nhsauth")

function setDefaultPreferences(preferenceDetails, preferences) {
    Object.keys(preferenceDetails).map((section) => {
        const prefs = preferenceDetails[section].preferences

        Object.keys(prefs).map((preferenceItem) => {
            const preferencePath = `${section}.preferences.${preferenceItem}`

            if (preferences[preferencePath] === undefined && prefs[preferenceItem].defaultValue !== undefined) {
                preferences[preferencePath] = prefs[preferenceItem].defaultValue
            }
        })
    })

    return preferences
}

/** @type {ServiceSchema} */
const UserService = {
    name: "userservice",
    actions: {
        createUser: {
            async handler(ctx) {
                const { nhsNumber, jti } = ctx.params

                const redisConfig = await getRedisConfig()
                const cacher = new RedisDataProvider(redisConfig, this.logger)

                const cacheProvider = new PatientCacheProvider(cacher)

                const userDataClient = new UserDataClient(this.connectionPool)
                const userGenerator = new UserGenerator(userDataClient)
                const tokenDataClient = new TokenDataClient(this.connectionPool)

                let user = await userDataClient.getUserByNhsNumber(nhsNumber)

                if (!user) {
                    user = await userGenerator.generateUser(nhsNumber)

                    if (!user) {
                        throw new MoleculerError("Unable to create user", 500)
                    }

                    const internalPatientGenerator = new InternalPatientGenerator(ctx, cacheProvider)
                    const reference = await internalPatientGenerator.generateInternalPatient(nhsNumber)

                    await userDataClient.setPatientReference(user.id, reference)
                }

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

                ctx.call("userservice.linkTopThreeThings", { userId: user.id })
            },
        },
        linkTopThreeThings: {
            async handler(ctx) {
                const { userId } = ctx.params

                const userDataClient = new UserDataClient(this.connectionPool)

                const user = await userDataClient.getUserById(userId)

                if (!user) {
                    throw new MoleculerError(`User ${userId} does not exist`, 403)
                }

                if (!user.nhsNumber) {
                    throw new MoleculerError(`User ${userId} has no NHS number`, 403)
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
                    throw new MoleculerError("T3T questionnaire not found", 400)
                }

                const topThreeThingsBundle = /** @type {fhir.Bundle} */ (await ctx.call("internalfhirservice.search", {
                    resourceType: "QuestionnaireResponse",
                    query: {
                        patient: `Patient/TMP:${user.nhsNumber}`,
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

                    return (
                        author.reference === `Patient/TMP:${user.nhsNumber}` ||
                        subject.reference === `Patient/TMP:${user.nhsNumber}` ||
                        source.reference === `Patient/TMP:${user.nhsNumber}`
                    )
                })

                questionnaireResponses.forEach((qr) => {
                    qr.author = qr.author || {}
                    qr.author.reference = user.reference
                    qr.subject = qr.subject || {}
                    qr.subject.reference = user.reference
                    qr.source = qr.source || {}
                    qr.source.reference = user.reference
                })

                for (let questionnaireResponse of questionnaireResponses) {
                    ctx.call("internalfhirservice.update", {
                        resourceType: "QuestionnaireResponse",
                        resourceId: questionnaireResponse.id,
                        resource: questionnaireResponse,
                    })
                }
            },
        },
        trackPage: {
            async handler(ctx) {
                const { jti, id } = ctx.meta.user
                const { url } = ctx.params.properties

                const tokenDataClient = new TokenDataClient(this.connectionPool)

                const token = await tokenDataClient.getToken(jti)

                if (!token) {
                    throw new MoleculerError("Token not found", 403)
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
        savePreferences: {
            async handler(ctx) {
                const { id } = ctx.meta.user
                const preferences = ctx.params

                if (!id) {
                    throw new MoleculerError("User not found", 403)
                }

                const userDataClient = new UserDataClient(this.connectionPool)

                const userPreferences = await userDataClient.getUserPreferences(id)

                let newUserPreferences = null

                if (!userPreferences) {
                    newUserPreferences = await userDataClient.createUserPreferences(id, preferences)
                } else {
                    newUserPreferences = await userDataClient.updateUserPreferences(id, preferences)
                }

                const preferenceDefaults = await getPreferenceDetails()

                const rehydrated = {
                    schema: preferenceDefaults,
                    preferences: setDefaultPreferences(
                        preferenceDefaults,
                        (newUserPreferences && newUserPreferences.preferences) || {}
                    ),
                }

                return rehydrated
            },
        },
        getPreferences: {
            async handler(ctx) {
                const { id } = ctx.meta.user

                if (!id) {
                    throw new MoleculerError("User not found", 403)
                }

                const userDataClient = new UserDataClient(this.connectionPool)

                const userPreferenceDetails = await userDataClient.getUserPreferences(id)

                const preferenceDefaults = await getPreferenceDetails()

                const rehydrated = {
                    schema: preferenceDefaults,
                    preferences: setDefaultPreferences(
                        preferenceDefaults,
                        (userPreferenceDetails && userPreferenceDetails.preferences) || {}
                    ),
                }

                return rehydrated
            },
        },
    },
    async started() {
        try {
            const config = await getDatabaseConfiguration()

            this.connectionPool = new pg.Pool(config)
        } catch (error) {
            this.logger.error(error.stack || error.message)
            throw error
        }
    },
}

async function getPreferenceDetails() {
    const config = await getNhsLoginConfig()

    const preferencesDetails = {
        general: {
            title: "General Preferences",
            preferences: {
                contrastMode: {
                    type: "boolean",
                    title: "Contrast Mode",
                    description: "Check to set contrast (dark) mode",
                    defaultValue: false,
                },
                patientSummary: {
                    type: "string",
                    editor: "radio",
                    title: "Patient Summary Display",
                    description:
                        "Select whether to show only the headings, or headings and list, on the Patient Summary page",
                    enum: ["headings", "headingsandlist"],
                    enumLabels: ["Headings Only", "Headings and List"],
                    defaultValue: "headingsandlist",
                },
            },
        },
        nhsLogin: {
            title: "NHS Login Preferences",
            preferences: {
                changeSettings: {
                    type: "link",
                    url: config.settingsUrl,
                    title: "Change NHS Login preferences",
                    target: "_blank",
                    description: "Click here to change NHS Login preferences",
                },
            },
        },
    }

    return preferencesDetails
}

module.exports = UserService
