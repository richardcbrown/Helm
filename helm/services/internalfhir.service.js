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
        status: "active",
        identifier: [
            {
                system,
                value,
            },
        ],
        item: [
            {
                linkId: "item1",
                type: "group",
                item: [
                    {
                        linkId: "title1",
                        type: "string",
                        prefix: "#1",
                        text: "Title for the first top three things",
                        maxLength: 75,
                    },
                    {
                        linkId: "description1",
                        type: "text",
                        prefix: "Description #1",
                        text: "Description for the first top three things",
                        maxLength: 500,
                    },
                ],
            },
            {
                linkId: "item2",
                type: "group",
                item: [
                    {
                        linkId: "title2",
                        type: "string",
                        prefix: "#2",
                        text: "Title for the second top three things",
                        maxLength: 75,
                    },
                    {
                        linkId: "description2",
                        type: "text",
                        prefix: "Description #2",
                        text: "Description for the second top three things",
                        maxLength: 500,
                    },
                ],
            },
            {
                linkId: "item3",
                type: "group",
                item: [
                    {
                        linkId: "title3",
                        type: "string",
                        prefix: "#3",
                        text: "Title for the third top three things",
                        maxLength: 75,
                    },
                    {
                        linkId: "description3",
                        type: "text",
                        prefix: "Description #3",
                        text: "Description for the third top three things",
                        maxLength: 500,
                    },
                ],
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
    },
}

module.exports = InternalFhirService
