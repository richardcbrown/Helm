/** @typedef {import("moleculer").LoggerInstance} Logger */
/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").FullResponse} FullResponse */
/** @typedef {import("request-promise-native").Options} Options */
/** @typedef {import("../config/config.fhirstore").FhirStoreConfig} FhirStoreConfig */

const request = require("request-promise-native")

class FhirStoreDataProvider {
    /** @param {Logger} logger */
    /** @param {FhirStoreConfig} configuration */
    constructor(configuration, logger) {
        this.logger = logger
        this.configuration = configuration
    }

    /**
     * @param {string} resourceType
     * @param {string} resourceID
     * @param {string} authorization
     * @returns {Promise<FullResponse>} response
     */
    async read(resourceType, resourceID, authorization) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "GET",
                uri: `${configuration.host}/${resourceType}/${resourceID}`,
                json: true,
                simple: false,
                auth: { bearer: authorization },
                rejectUnauthorized: false,
            }
            return await request(options)
        } catch (err) {
            this.logger.error(err)

            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {Object} query
     * @param {string} authorization
     * @returns {Promise<FullResponse>} response
     */
    async search(resourceType, query, authorization) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "GET",
                uri: `${configuration.host}/${resourceType}`,
                json: true,
                qs: query,
                simple: false,
                auth: { bearer: authorization, sendImmediately: true },
                rejectUnauthorized: false,
            }

            return await request(options)
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {Object} resource
     * @param {string} authorization
     * @returns {Promise<FullResponse>} response
     */
    async create(resourceType, resource, authorization) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "POST",
                uri: `${configuration.host}/${resourceType}`,
                json: true,
                body: resource,
                simple: false,
                auth: { bearer: authorization, sendImmediately: true },
                rejectUnauthorized: false,
            }
            return await request(options)
        } catch (err) {
            this.logger.error(err)
            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {string} resourceID
     * @param {Object} resource
     * @param {string} authorization
     * @returns {Promise<FullResponse>} response
     */
    async update(resourceType, resourceID, resource, authorization) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "PUT",
                uri: `${configuration.host}/${resourceType}/${resourceID}`,
                json: true,
                body: resource,
                simple: false,
                auth: { bearer: authorization, sendImmediately: true },
                rejectUnauthorized: false,
            }
            return await request(options)
        } catch (err) {
            this.logger.error(err)
            throw err
        }
    }

    /**
     * @param {string} resourceType
     * @param {string} resourceID
     * @param {string} authorization
     * @returns {Promise<FullResponse>} response
     */
    async remove(resourceType, resourceID, authorization) {
        try {
            const { configuration } = this

            /** @type {Options} */
            const options = {
                method: "DELETE",
                uri: `${configuration.host}/${resourceType}/${resourceID}`,
                simple: false,
                resolveWithFullResponse: true,
                auth: { bearer: authorization, sendImmediately: true },
                rejectUnauthorized: false,
            }
            return await request(options)
        } catch (err) {
            this.logger.error(err)
            throw err
        }
    }
}

module.exports = FhirStoreDataProvider
