const redis = require("redis")

class RedisDataProvider {
    constructor(configuration) {
        this.configuration = configuration

        const { host, port } = configuration

        this.client = redis.createClient({ host, port })
    }

    /**
     * Get data from redis by key
     * @public
     * @param {string} key
     * @returns {Promise<any>}
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(JSON.parse(result))
                }
            })
        })
    }

    /**
     * Set data in redis by key
     * @public
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    set(key, value) {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }
}

module.exports = RedisDataProvider
