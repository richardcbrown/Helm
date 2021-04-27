const crypto = require("crypto")

class RepositoryCacheProvider {
    /**
     * @param {import("moleculer").Cacher} cacher
     */
    constructor(cacher) {
        this.cacher = cacher
        this.ttl = 3000
    }

    async setRepositoryData(query, results) {
        const currentPage = Number(query.page)

        const queryHash = crypto
            .createHash("md5")
            .update(JSON.stringify({ q: query.q, tags: query.tags, page: currentPage }))
            .digest("hex")

        return await this.cacher.set(this.createCacheKey(queryHash, "respository_query"), results, this.ttl)
    }

    async getRepositoryData(query) {
        const currentPage = Number(query.page)

        const queryHash = crypto
            .createHash("md5")
            .update(JSON.stringify({ q: query.q, tags: query.tags, page: currentPage }))
            .digest("hex")

        return await this.cacher.get(this.createCacheKey(queryHash, "respository_query"))
    }

    /**
     * @private
     * @param {string} cacheIdentifier
     * @param {string} cacheItem
     * @returns {string}
     */
    createCacheKey(cacheIdentifier, cacheItem) {
        return `${cacheIdentifier}:${cacheItem}`
    }
}

module.exports = { RepositoryCacheProvider }
