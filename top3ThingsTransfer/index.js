require('dotenv').config()
const pg = require("pg")
const request = require("request-promise-native")
const CronJob = require("cron").CronJob
const jwt = require("jsonwebtoken")

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
    const client = await connectionPool.connect()

    try {
        const { rows } = await client.query(`
            SELECT "NhsNumber" AS nhsnumber, "EcisTopThreeThings" AS ecistopthreethings, "Id" AS id FROM transfer.transferdata
        `)

        console.log(`${rows.length} found in transfer database`)

        return rows
    } catch (error) {

        console.log(error.stack || error.message)

        throw error
    } finally {
        client.release()
    }
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

    const questionnaireBundle = await fhirStoreDataProvider.search("Questionnaire", { identifier: process.env.QUESTIONNAIRE_IDENTIFIER }, null)

    const questionnaire = getFromBundle(questionnaireBundle, "Questionnaire")[0]

    if (!questionnaire) {
        throw Error("Questionnaire not found")
    }

    /** @type {fhir.QuestionnaireResponse[]} */
    const questionnaires = []

    entries.forEach((entry) => {
        const { nhsnumber, ecistopthreethings, id } = entry

        const t3tComponents = ecistopthreethings["/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value='Top issues']"]["/content[openEHR-EHR-OBSERVATION.story.v1]"][0]["/data[at0001]"]["/events"]["/events[at0002]"][0]["/data[at0003]"]["/items[openEHR-EHR-CLUSTER.issue.v0]"]
        const dateComponent = ecistopthreethings["/composition[openEHR-EHR-COMPOSITION.encounter.v1 and name/value='Top issues']"]["/content[openEHR-EHR-OBSERVATION.story.v1]"][0]["/data[at0001]"]["/origin"]["/value"].value

        const firstItem = t3tComponents.find((com) => com["/name"][0].value === "Issue 1")
        const secondItem = t3tComponents.find((com) => com["/name"][0].value === "Issue 2")
        const thirdItem = t3tComponents.find((com) => com["/name"][0].value === "Issue 3")

        const firstItemName = (firstItem && firstItem["/items[at0001]"] && firstItem["/items[at0001]"][0] && firstItem["/items[at0001]"][0]["/value"].value) || null
        const firstItemDetail = (firstItem && firstItem["/items[at0002]"] && firstItem["/items[at0002]"][0] && firstItem["/items[at0002]"][0]["/value"].value) || null
        const secondItemName = (secondItem && secondItem["/items[at0001]"] && secondItem["/items[at0001]"][0] && secondItem["/items[at0001]"][0]["/value"].value) || null
        const secondItemDetail = (secondItem && secondItem["/items[at0002]"] && secondItem["/items[at0002]"][0] && secondItem["/items[at0002]"][0]["/value"].value) || null
        const thirdItemName = (thirdItem && thirdItem["/items[at0001]"] && thirdItem["/items[at0001]"][0] && thirdItem["/items[at0001]"][0]["/value"].value) || null
        const thirdItemDetail = (thirdItem && thirdItem["/items[at0002]"] && thirdItem["/items[at0002]"][0] && thirdItem["/items[at0002]"][0]["/value"].value) || null

        /** @type {fhir.QuestionnaireResponse} */
        const questionnaireResponse = {
            status: "completed",
            resourceType: "QuestionnaireResponse",
            questionnaire: {
                reference: `${questionnaire.resourceType}/${questionnaire.id}`
            },
            identifier: {
                system: "https://fhir.helm.org/identifier/ecis-legacy-id",
                value: id
            },
            author: {
                reference: `Patient/TMP:${nhsnumber}`,
                identifier: {
                    system: "https://fhir.nhs.uk/Id/nhs-number",
                    value: `${nhsnumber}`
                }
            },
            subject: {
                reference: `Patient/TMP:${nhsnumber}`,
                identifier: {
                    system: "https://fhir.nhs.uk/Id/nhs-number",
                    value: `${nhsnumber}`
                }
            },
            source: {
                reference: `Patient/TMP:${nhsnumber}`,
                identifier: {
                    system: "https://fhir.nhs.uk/Id/nhs-number",
                    value: `${nhsnumber}`
                }
            },
            item: [
                {
                    linkId: "item1",
                    item: [
                        {
                            linkId: "title1",
                            answer: [{ valueString: firstItemName || "" }]
                        },
                        {
                            linkId: "description1",
                            answer: [{ valueString: firstItemDetail || "" }]
                        },
                    ],
                },
                {
                    linkId: "item2",
                    item: [
                        {
                            linkId: "title2",
                            answer: [{ valueString: secondItemName || "" }]
                        },
                        {
                            linkId: "description2",
                            answer: [{ valueString: secondItemDetail || "" }]
                        },
                    ],
                },
                {
                    linkId: "item3",
                    item: [
                        {
                            linkId: "title3",
                            answer: [{ valueString: thirdItemName || "" }]
                        },
                        {
                            linkId: "description3",
                            answer: [{ valueString: thirdItemDetail || "" }]
                        },
                    ],
                },
            ],
            authored: dateComponent
        }

        questionnaires.push(questionnaireResponse)
    })

    console.log(`${questionnaires.length} questionnaire responses transformed`)

    return questionnaires
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
        .then(writeToFhirStore)
        .then(() => console.log("Import run complete"))
        .catch((error) => console.log(error.stack || error.message))
        .finally(() => console.log("Run Complete"))
})

transferJob.start()