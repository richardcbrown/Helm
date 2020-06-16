/**
 * @typedef {Object} PatientCacheKeysEnum
 * @property {"pending_patient_status"} PendingPatientStatus
 */

/**
 * @typedef {Object} PendingPatientStatusEnum
 * @property {"searching"} Searching
 * @property {"found"} Found
 * @property {"notfound"} NotFound
 * @property {"received"} Received
 * @property {"registered"} Registered
 */

/** @type {PatientCacheKeysEnum} */
const PatientCacheKeys = {
    PendingPatientStatus: "pending_patient_status",
}

/** @type {PendingPatientStatusEnum} */
const PendingPatientStatus = {
    Received: "received",
    Registered: "registered",
    Searching: "searching",
    Found: "found",
    NotFound: "notfound",
}

class PatientCacheProvider {
    /**
     * @param {import("moleculer").Cacher} cacher
     */
    constructor(cacher) {
        this.cacher = cacher
    }

    /**
     * @public
     * @param {string} nhsNumber
     * @param {"searching" | "found" | "notfound" | "received" | "registered"} status
     * @returns {Promise<any>}
     */
    setPendingPatientStatus(nhsNumber, status) {
        return this.cacher.set(this.createCacheKey(nhsNumber, PatientCacheKeys.PendingPatientStatus), status)
    }

    /**
     * @public
     * @param {string} nhsNumber
     * @returns {Promise<"searching" | "found" | "notfound" | "received" | "registered" | null>}
     */
    async getPendingPatientStatus(nhsNumber) {
        const result = await this.cacher.get(this.createCacheKey(nhsNumber, PatientCacheKeys.PendingPatientStatus))

        return result
    }

    /**
     * @private
     * @param {string} nhsNumber
     * @param {"pending_patient_status"} cacheItem
     * @returns {string}
     */
    createCacheKey(nhsNumber, cacheItem) {
        return `${nhsNumber}:${cacheItem}`
    }
}

module.exports = { PatientCacheProvider, PendingPatientStatus }
