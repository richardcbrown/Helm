/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").FullResponse} FullResponse */
/** @typedef {import("request-promise-native").Options} Options */
/** @typedef {import("../config/config.fhirstore").FhirStoreConfig} FhirStoreConfig */

const request = require("request-promise-native")
const https = require("https")
const fs = require("fs")
const path = require("path")

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
    configure(request) {}

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

module.exports = FhirStoreDataProvider
