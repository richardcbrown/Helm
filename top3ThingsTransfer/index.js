require('dotenv').config()
const pg = require("pg")
const request = require("request-promise-native")
const CronJob = require("cron").CronJob
const jwt = require("jsonwebtoken")
const fs = require("fs")

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager()

class EmptyTokenProvider {
    /**
     * @public
     * @param {import("./fhirstore.tokenprovider").RequestOptions} request
     * @returns {Promise<void>}
     */
    async authorize(request) {
        const key = await secretManager.getSecret("PRIVATE_KEY", true)

        request.auth = { bearer: jwt.sign({ sub: "internal" }, key, { algorithm: "RS256" }) }
    }
}

class FhirStoreDataProvider {
    /** @param {Logger} logger */
    /** @param {FhirStoreConfig} configuration */
    /** @param {import("./types").RequestAuthProvider} authProvider */
    constructor(configuration, logger, authProvider) {
        this.logger = logger
        this.configuration = configuration
        this.authProvider = authProvider
    }

    /** @private */
    configure(request) { }

    /**
     * @param {string} resourceType
     * @param {string} resourceID
     * @returns {Promise<fhir.Resource>} response
     */
    async read(resourceType, resourceID, nhsNumber) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "GET",
                uri: `${configuration.host}/${resourceType}/${resourceID}`,
                json: true,
                simple: true,
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
            }

            this.configure(options)

            await this.authProvider.authorize(options, nhsNumber)

            const result = await request(options)

            return result.body
        } catch (err) {
            this.logger.error(err)

            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {Object} query
     * @returns {Promise<fhir.Bundle>} response
     */
    async search(resourceType, query, nhsNumber) {
        try {
            const { configuration } = this

            console.log(resourceType, query, nhsNumber)

            /** @type {Options} */
            const options = {
                method: "GET",
                uri: `${configuration.host}/${resourceType}`,
                json: true,
                qs: query,
                simple: true,
                resolveWithFullResponse: true,
                rejectUnauthorized: false,
            }

            this.configure(options)

            await this.authProvider.authorize(options, nhsNumber)

            const result = await request(options)

            return result.body
        } catch (err) {
            /** @todo logging */
            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {Object} resource
     * @returns {Promise<FullResponse>} response
     */
    async create(resourceType, resource, nhsNumber) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "POST",
                uri: `${configuration.host}/${resourceType}`,
                body: JSON.stringify(resource),
                simple: false,
                headers: { "Content-Type": "application/fhir+json" },
                resolveWithFullResponse: true,
                rejectUnauthorized: false,
            }

            this.configure(options)

            await this.authProvider.authorize(options, nhsNumber)

            const result = await request(options)

            return result
        } catch (err) {
            this.logger.error(err)
            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {string} resourceID
     * @param {Object} resource
     * @returns {Promise<FullResponse>} response
     */
    async update(resourceType, resourceID, resource, nhsNumber) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "PUT",
                uri: `${configuration.host}/${resourceType}/${resourceID}`,
                body: JSON.stringify(resource),
                simple: false,
                headers: { "Content-Type": "application/fhir+json" },
                resolveWithFullResponse: true,
                rejectUnauthorized: false,
            }

            this.configure(options)

            await this.authProvider.authorize(options, nhsNumber)

            return await request(options)
        } catch (err) {
            this.logger.error(err)
            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {string} resourceID
     * @returns {Promise<FullResponse>} response
     */
    async remove(resourceType, resourceID, nhsNumber) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "DELETE",
                uri: `${configuration.host}/${resourceType}/${resourceID}`,
                simple: false,
                resolveWithFullResponse: true,
                rejectUnauthorized: false,
            }

            this.configure(options)

            await this.authProvider.authorize(options, nhsNumber)

            return await request(options)
        } catch (err) {
            this.logger.error(err)
            throw err
        }
    }
}


async function loadEntries() {
    const tokenProvider = new EmptyTokenProvider()
    const fhirStoreDataProvider = new FhirStoreDataProvider({ host: process.env.INTERNAL_FHIRSTORE_URL }, { error: (err) => console.log(err) }, tokenProvider)
    const questionnaireBundle = await fhirStoreDataProvider.search("Questionnaire", { identifier: process.env.TOP3THINGS_QUESTIONNAIRE_IDENTIFIER }, null)

    // console.log("questionnaireBundle: ", questionnaireBundle)
    // console.log(questionnaireBundle.entry[0].resource)
    // console.log("ID: ", questionnaireBundle.entry[0].resource.id)

    const questionnaireResponseBundle = await fhirStoreDataProvider.search("QuestionnaireResponse", { questionnaire: "Questionnaire/" + questionnaireBundle.entry[0].resource.id }, null)

    // console.log("questionnaireResponseBundle: ", questionnaireResponseBundle)
    // console.log(questionnaireResponseBundle.entry[0].resource)
    return questionnaireResponseBundle.entry
}

/**
 *
 * @param {fhir.Bundle} bundle
 * @param {string} resourceType
 * @returns {Array<fhir.Resource>} matching resources
 */
function getFromBundle(bundle, resourceType) {
    const { entry } = bundle

    if (!entry) {
        return []
    }

    const resources = /** @type {fhir.Resource[]} */ (entry
        .filter((e) => e.resource && e.resource.resourceType === resourceType)
        .map((e) => e.resource)
        .filter((r) => !!r))

    return resources
}

async function transformEntries(entries) {

    const fhirStoreDataProvider = new FhirStoreDataProvider({ host: process.env.INTERNAL_FHIRSTORE_URL }, { error: (err) => console.log(err) }, new EmptyTokenProvider())

    const questionnaireBundle = await fhirStoreDataProvider.search("Questionnaire", { identifier: process.env.ABOUT_ME_QUESTIONNAIRE_IDENTIFIER }, null)

    const questionnaire = getFromBundle(questionnaireBundle, "Questionnaire")[0]
    if (!questionnaire) {
        throw Error("Questionnaire not found")
    }

    const aboutMeId = questionnaireBundle.entry[0].resource.id

    // console.log("aboutMeId: ", aboutMeId)
    const searchForId = await fhirStoreDataProvider.search("QuestionnaireResponse", { questionnaire: "Questionnaire/" + aboutMeId }, null)

    entries.map(async (entry) => {
        // console.log("entry: ", entry)
        const answersArray = []
        entry.resource.item.map((item) => {
            // console.log("item: ", item)
            item.item.map((indItem) => {
                // console.log("indItem: ", indItem)
                const answer = indItem.answer[0].valueString
                // console.log("answer: ", answer)
                answersArray.push(answer)
            })
            // console.log("concatted answers: ", answersArray.join(" "))
            const concattedAnswer = answersArray.join(" ")
            entry.resource.questionnaire = { "reference": "Questionnaire/" + aboutMeId }
            const newItem = [{
                "linkId": "item1",
                "text": "What matters to me?",
                "answer": [{ "valueString": concattedAnswer, "valueDateTime": entry.resource.authored }]
            }]
            entry.resource.item = newItem

        })
        const finalEntry = entry.resource
        // console.log("finalEntry: ", entry.resource)
        // console.log("searchforId: ", searchForId)
        if (readyToBeTransformed(searchForId.entry, finalEntry.id)) {
            console.log("ready")
            const submitT3T = await fhirStoreDataProvider.update("QuestionnaireResponse", entry.resource.id, finalEntry, null)
            console.log(submitT3T)
        }
    })


    /** @type {fhir.QuestionnaireResponse[]} */
    const questionnaires = []

    console.log(`${questionnaires.length} questionnaire responses transformed`)

    return questionnaires
}

function readyToBeTransformed(searchRes, id) {
    let returnBool = true
    searchRes.map((entry) => {
        if (entry.resource.id == id) {
            returnBool = false
        }
    })
    return returnBool
}

/**
 * @param {fhir.QuestionnaireResponse} questionnaireResponse 
 */
function getIdentifier(questionnaireResponse) {
    const { identifier } = questionnaireResponse

    if (!identifier) {
        return null
    }

    const { system, value } = identifier

    if (!value) {
        return null
    }

    return system ? `${system}|${value}` : `${value}`
}

/**
 * @param {fhir.QuestionnaireResponse[]} questionnaires 
 */
async function writeToFhirStore(questionnaires) {

    const fhirStoreDataProvider = new FhirStoreDataProvider({ host: process.env.INTERNAL_FHIRSTORE_URL }, { error: (err) => console.log(err) }, new EmptyTokenProvider())

    const questionnaireBundle = await fhirStoreDataProvider.search("Questionnaire", { identifier: process.env.QUESTIONNAIRE_IDENTIFIER }, null)

    const questionnaire = getFromBundle(questionnaireBundle, "Questionnaire")[0]

    if (!questionnaire) {
        throw Error("Questionnaire not found")
    }

    const questionnaireResponseBundle = await fhirStoreDataProvider.search("QuestionnaireResponse", { questionnaire: `Questionnaire/${questionnaire.id}` }, null)

    const existingQuestionnaireResponses = /** @type {fhir.QuestionnaireResponse[]} */ (getFromBundle(questionnaireResponseBundle, "QuestionnaireResponse"))

    console.log(`${existingQuestionnaireResponses.length} existing questionnaire responses in fhir store`)

    const qResponsesToBeWritten = questionnaires.filter((qr) => {
        const newIdentifier = getIdentifier(qr)

        return !existingQuestionnaireResponses.some((eqr) => {
            const existingIdentifier = getIdentifier(eqr)

            return newIdentifier && existingIdentifier && newIdentifier === existingIdentifier
        })
    })

    console.log(`${qResponsesToBeWritten.length} to be written to fhirstore`)

    const success = []
    const errors = []

    for (let writeRequest of qResponsesToBeWritten) {
        const response = await fhirStoreDataProvider.create("QuestionnaireResponse", writeRequest, null)

        const { body, statusCode } = response

        if (statusCode === 200 || statusCode === 201) {
            success.push(body)
        } else {
            errors.push(body)
        }
    }

    console.log(`${success.length} successful responses`)
    console.log(`${errors.length} error responses`)

    console.log("error details")

    for (let error of errors) {
        console.log(error)
    }
}

const transferJob = new CronJob(process.env.CRON, () => {
    console.log("Run Started")

    loadEntries()
        .then(transformEntries)
        // .then(writeToFhirStore)
        // .then(() => console.log("Import run complete"))
        .catch((error) => console.log(error.stack || error.message))
        .finally(() => console.log("Run Complete"))
})

transferJob.start()