/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const TokenProvider = require("../providers/token.provider")

const fhirservice = require("./fhir.service")
const {
    searchActionHandler,
    readActionHandler,
    createActionHandler,
    updateActionHandler,
} = require("../handlers/fhirservice.handlers")
const getFhirStoreConfig = require("../config/config.internalfhirstore")
const getFhirAuthConfig = require("../config/config.internalfhirauth")
const AuthProvider = require("../providers/auth.provider")
const InternalFhirDataProvider = require("../providers/internalfhirstore.dataprovider")
const EmptyTokenProvider = require("../providers/fhirstore.emptytokenprovider")
const { getFromBundle } = require("../models/bundle.helpers")

/** @type {fhir.Questionnaire} */
const questionnaire = {
    resourceType: "Questionnaire",
    status: "active",
    identifier: [
        {
            system: "http://test.com",
            value: "test",
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
                    text: "#1",
                    maxLength: 75,
                },
                {
                    linkId: "description1",
                    type: "text",
                    text: "Description #1",
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
                    text: "#2",
                    maxLength: 75,
                },
                {
                    linkId: "description2",
                    type: "text",
                    text: "Description #2",
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
                    text: "#3",
                    maxLength: 75,
                },
                {
                    linkId: "description3",
                    type: "text",
                    text: "Description #3",
                    maxLength: 500,
                },
            ],
        },
    ],
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
        const existingQuestionnaireBundle = await this.fhirDataProvider.search(
            "Questionnaire",
            {
                identifier: "http://test.com|test",
            },
            null
        )

        const existingQuestionnaire = getFromBundle(existingQuestionnaireBundle, "Questionnaire")[0] || null

        if (existingQuestionnaire !== null) {
            return
        }

        await this.fhirDataProvider.create("Questionnaire", questionnaire, null)
    }
}

/** @type {ServiceSchema} */
const InternalFhirService = {
    name: "internalfhirservice",
    mixins: [fhirservice],
    methods: {
        async searchActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await searchActionHandler.call(this, ctx, fhirStore)
        },
        async readActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await readActionHandler.call(this, ctx, fhirStore)
        },
        async createActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await createActionHandler.call(this, ctx, fhirStore)
        },
        async updateActionHandler(ctx) {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
            }

            const fhirStore = new InternalFhirDataProvider(storeConfig, this.logger, tokenProvider)

            return await updateActionHandler.call(this, ctx, fhirStore)
        },
    },
    async started() {
        try {
            const authConfig = await getFhirAuthConfig()
            const storeConfig = await getFhirStoreConfig()

            let tokenProvider

            if (authConfig.authenticate) {
                const authProvider = new AuthProvider(authConfig, this.logger)
                tokenProvider = new TokenProvider(authProvider, this.logger)
            } else {
                tokenProvider = new EmptyTokenProvider()
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
