/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").FullResponse} FullResponse */
/** @typedef {import("request-promise-native").Options} Options */
/** @typedef {import("../config/config.fhirstore").FhirStoreConfig} FhirStoreConfig */

const request = require("request-promise-native")
const { MoleculerError } = require("moleculer").Errors

class CoreFhirDataProvider {
    /** @param {Logger} logger */
    /** @param {FhirStoreConfig} configuration */
    /** @param {import("./types").RequestAuthProvider} authProvider */
    constructor(configuration, logger, authProvider, tracer) {
        this.logger = logger
        this.configuration = configuration
        this.authProvider = authProvider
        this.tracer = tracer
    }

    /** @protected */
    configure(options) {}

    determineResponse(response) {
        const { body, statusCode } = response

        if (statusCode === 200 || statusCode === 201) {
            return body
        }

        throw new MoleculerError(body, statusCode)
    }

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

            return this.determineResponse(result)
        } catch (err) {
            this.logger.error("Error on FHIRService Read")
            this.logger.error(`${this.configuration.host}/${resourceType}/${resourceID}`)
            this.logger.error(err.stack || err.message)

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

            return this.determineResponse(result)
        } catch (err) {
            this.logger.error("Error on FHIRService Search")
            this.logger.error(`${this.configuration.host}/${resourceType}`)
            this.logger.error(JSON.stringify(query))
            this.logger.error(err.stack || err.message)

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

            return this.determineResponse(result)
        } catch (err) {
            this.logger.error("Error on FHIRService Create")
            this.logger.error(`${this.configuration.host}/${resourceType}`)
            this.logger.error(err.stack || err.message)

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

            const result = await request(options)

            return this.determineResponse(result)
        } catch (err) {
            this.logger.error("Error on FHIRService Update")
            this.logger.error(`${this.configuration.host}/${resourceType}`)
            this.logger.error(err.stack || err.message)

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

            const result = await request(options)

            return this.determineResponse(result)
        } catch (err) {
            this.logger.error("Error on FHIRService Remove")
            this.logger.error(`${this.configuration.host}/${resourceType}/${resourceID}`)
            this.logger.error(err.stack || err.message)
            throw err
        }
    }
}

module.exports = CoreFhirDataProvider
