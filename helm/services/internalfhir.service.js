/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const fhirservice = require("./fhir.service")
const {
    searchActionHandler,
    readActionHandler,
    createActionHandler,
    updateActionHandler,
} = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.internalfhirstore")
const InternalAuthProvider = require("../providers/internal.authprovider")
const InternalFhirDataProvider = require("../providers/internalfhirstore.dataprovider")
const { getFromBundle } = require("../models/bundle.helpers")
const getConfig = require("../config/config.general")

function getQuestionnaire(config) {
    const system = config.questionnaireSystem
    const value = config.questionnaireValue

    /** @type {fhir.Questionnaire} */
    const questionnaire = {
        resourceType: "Questionnaire",
        name: "what-matters-to-me",
        title: "HELM What Matters To Me",
        status: "active",
        code: [
            {
                system: "http://snomed.info/sct",
                code: "397608007",
                display: "Health management finding (finding)"
            }
        ],
        identifier: [
            {
                system,
                value,
            },
        ],
        item: [
            {
                code: [
                    {
                        system: "http://snomed.info/sct",
                        code: "363882003",
                        display: "Drive (observable entity)"
                    }
                ],
                linkId: "item1",
                type: "text",
                id: "1",
                prefix: "What Matters to Me?",
                text: "Think about your core values, spiritual beliefs, culture, ethnicity and religion as they relate to your care. " +
                    "Think about meaningful activities you enjoy, pets, objects, computer games, exercise sport, places you like to visit, " +
                    "education or spending time with family and friends." +
                    "\nPlease Do: Consider any preferences and what you want someone to do when caring for or supporting you." +
                    "\nPlease Don’t: Consider the important things that you don’t want someone to do when caring for or supporting you." +
                    "  This could include not asking questions about certain topics, making assumptions about something, and providing support when it is not wanted.",
                maxLength: 500

            },
            {
                code: [
                    {
                        system: "http://snomed.info/sct",
                        code: "302160007",
                        display: "Social / personal history observable (observable entity)"
                    }
                ],
                linkId: "item2",
                type: "text",
                id: "2",
                prefix: 'Who are the most important people in my life?',
                text: "Consider friends, family, staff in the care home and people who support you at home, in the community or at a club." +
                    "  Also include how you stay connected to these people.",
                maxLength: 500
            },
            {
                code: [
                    {
                        system: "http://snomed.info/sct",
                        code: "711043000",
                        display: "Evaluation procedure (procedure)"
                    }
                ],
                linkId: "item3",
                type: "text",
                id: "3",
                prefix: 'What do I do to keep myself well?',
                text: "Consider how you feel on a typical day through to how you feel on a day when you are unwell or very unwell. " +
                    "\nConsider any conditions or symptoms that you live with, how they affect you and how you manage them.  This could" +
                    " include, for example, long-term pain and how you currently manage it. " +
                    "\nConsider anything that can help or hinder your wellness.  Include what causes" +
                    " you to become unwell and how you avoid or address them.  Also Include any signs that may indicate that you are " +
                    "becoming unwell and how do you manage them.",
                maxLength: 500
            },
            {
                code: [{
                    system: "http://snomed.info/sct",
                    code: "713578002",
                    display: "Identifying goals (procedure)"
                }],
                linkId: "item4",
                type: "text",
                id: "4",
                prefix: 'Things to think about in the future',
                text: "Consider your goals and hopes. Include what drives you to keep well or to manage a condition.  " +
                    "This could include being able to do the things that you enjoy, such as specific activities with your friends and family members.",
                maxLength: 500
            },
        ],
    }

    return questionnaire
}


async function getPolicies() {
    const config = await getConfig()

    return config.policies
}

class InitialInternalFhirStoreGenerator {
    /**
     *
     * @param {InternalFhirDataProvider} fhirDataProvider
     */
    constructor(fhirDataProvider) {
        this.fhirDataProvider = fhirDataProvider
    }

    async generate() {
        const config = await getConfig()

        const system = config.questionnaireSystem
        const value = config.questionnaireValue

        const questionnaire = getQuestionnaire(config)

        const existingQuestionnaireBundle = await this.fhirDataProvider.search(
            "Questionnaire",
            {
                identifier: `${system}|${value}`,
            },
            null
        )

        const existingQuestionnaire = getFromBundle(existingQuestionnaireBundle, "Questionnaire")[0] || null

        if (existingQuestionnaire === null) {
            await this.fhirDataProvider.create("Questionnaire", questionnaire, null)
        }

        const policies = await getPolicies()

        const existingPolicyBundle = await this.fhirDataProvider.search("Policy", {}, null)

        const existingPolicies = getFromBundle(existingPolicyBundle, "Policy")

        for (const policy of policies) {
            if (!existingPolicies.some((pol) => pol.name === policy.name)) {
                await this.fhirDataProvider.create("Policy", policy, null)
            }
        }
    }
}

/** @type {ServiceSchema} */
const InternalFhirService = {
    name: "internalfhirservice",
    mixins: [fhirservice],
    methods: {
        async searchActionHandler(ctx) {
            const storeConfig = await getFhirStoreConfig()

            const authProvider = new InternalAuthProvider()

            let tokenProvider = {
                authorize: async (request) => {
                    const token = await authProvider.authenticate(ctx.meta.user)

                    request.auth = { bearer: token.access_token }
                },
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await searchActionHandler.call(this, ctx, fhirStore)
        },
        async readActionHandler(ctx) {
            const storeConfig = await getFhirStoreConfig()

            const authProvider = new InternalAuthProvider()

            let tokenProvider = {
                authorize: async (request) => {
                    const token = await authProvider.authenticate(ctx.meta.user)

                    request.auth = { bearer: token.access_token }
                },
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await readActionHandler.call(this, ctx, fhirStore)
        },
        async createActionHandler(ctx) {
            const storeConfig = await getFhirStoreConfig()

            const authProvider = new InternalAuthProvider()

            let tokenProvider = {
                authorize: async (request) => {
                    const token = await authProvider.authenticate(ctx.meta.user)

                    request.auth = { bearer: token.access_token }
                },
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await createActionHandler.call(this, ctx, fhirStore)
        },
        async updateActionHandler(ctx) {
            const storeConfig = await getFhirStoreConfig()

            const authProvider = new InternalAuthProvider()

            let tokenProvider = {
                authorize: async (request) => {
                    const token = await authProvider.authenticate(ctx.meta.user)

                    request.auth = { bearer: token.access_token }
                },
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await updateActionHandler.call(this, ctx, fhirStore)
        },
    },
    async started() {
        setTimeout(async () => {
            try {

                const storeConfig = await getFhirStoreConfig()

                const authProvider = new InternalAuthProvider()

                let tokenProvider = {
                    authorize: async (request) => {
                        const token = await authProvider.authenticate({ sub: "internal" })

                        request.auth = { bearer: token.access_token }
                    },
                }

                const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

                const initialGenerator = new InitialInternalFhirStoreGenerator(fhirStore)

                await initialGenerator.generate()
            } catch (error) {
                this.logger.error(error.stack || error.message)
                throw error
            }
        }, 10000)
    },
}

module.exports = InternalFhirService
