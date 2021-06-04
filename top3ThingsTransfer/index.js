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

    console.log(Object.keys(questionnaireBundle))
    console.log(Object.keys(questionnaireBundle).includes('entry'))

    if (Object.keys(questionnaireBundle).includes('entry')) {
        const top3ThingsId = questionnaireBundle.entry[0].resource.id

        console.log("Top3Things Questionnaire ID: ", top3ThingsId)

        const questionnaireResponseBundle = await fhirStoreDataProvider.search("QuestionnaireResponse", { questionnaire: "Questionnaire/" + top3ThingsId }, null)
        if (Object.keys(questionnaireResponseBundle).includes('entry'))
            console.log(questionnaireResponseBundle.entry.length, " Top 3 Things responses found")
        return questionnaireResponseBundle.entry
    } else {
        console.log("0 Top 3 Things found")
    }
    return []
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

    console.log("aboutMeId: ", aboutMeId)

    const searchForId = await fhirStoreDataProvider.search("QuestionnaireResponse", { questionnaire: "Questionnaire/" + aboutMeId }, null)

    const questionnaires = []
    entries.map(async (entry) => {
        const answersArray = []
        entry.resource.item.map((item) => {
            item.item.map((indItem) => {
                const answer = indItem.answer[0].valueString
                answersArray.push(answer)
            })
            const concattedAnswer = answersArray.join(" ")
            entry.resource.questionnaire = { "reference": "Questionnaire/" + aboutMeId }
            const newItem = [{
                "linkId": "item1",
                "text": "What matters to me?",
                "answer": [{ "valueString": concattedAnswer, "valueDateTime": entry.resource.authored }]
            }]
            entry.resource.item = newItem

        })
        const finalEntry = { ...entry.resource }
        finalEntry.basedOn = [{
            "id": finalEntry.id
        }]


        if (readyToBeTransformed(searchForId.entry, finalEntry.id)) {
            delete finalEntry.id
            await questionnaires.push(finalEntry)
            console.log(finalEntry)
            const submitT3T = await fhirStoreDataProvider.create("QuestionnaireResponse", finalEntry, null)
            await console.log("response from FhirStore: ", submitT3T.body)

        }
    })

    console.log(`${questionnaires.length} questionnaire responses transformed`)

    return questionnaires
}

function readyToBeTransformed(searchRes, id) {
    let returnBool = true
    searchRes.map((entry) => {
        if (Object.keys(entry.resource).includes('basedOn')) {
            if (entry.resource.basedOn[0].id == id) {
                returnBool = false
            }
        }
    })
    return returnBool
}


const transferJob = new CronJob(process.env.CRON, () => {
    console.log("Run Started")

    loadEntries()
        .then(transformEntries)
        .catch((error) => console.log(error.stack || error.message))
        .finally(() => console.log("Run Complete"))
})

transferJob.start()