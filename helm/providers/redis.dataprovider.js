const redis = require("redis")

class RedisDataProvider {
    constructor(configuration, logger) {
        this.logger = logger

        this.configuration = configuration

        this.createClient = this.createClient.bind(this)

        this.createClient()
    }

    /**
     * @private
     */
    createClient() {
        try {
            const { host, port } = this.configuration

            const client = redis.createClient({
                host,
                port,
                retry_strategy: function (options) {
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        // End reconnecting after a specific timeout and flush all commands
                        // with a individual error
                        return new Error("Retry time exhausted")
                    }
                    if (options.attempt > 10) {
                        // End reconnecting with built in error
                        return new Error("Maximum retry attempts reached")
                    }
                    // reconnect after
                    return Math.min(options.attempt * 100, 3000)
                },
            })

            client.on("ready", () => {
                this.logger.info("REDIS CLIENT READY")
            })

            client.on("connect", () => {
                this.logger.info("REDIS CLIENT CONNECTED")
            })

            client.on("error", (error) => {
                this.logger.error(error.stack || error.message || error)

                this.logger.info("Attempting reconnect")

                setTimeout(() => this.createClient(), 5000)
            })

            this.client = client
        } catch (error) {
            this.logger.error(error.stack || error.message)
        }
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
                    this.logger.error(error.stack || error.message || error)

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
     * @param {number} [ttl]
     * @returns {Promise<void>}
     */
    set(key, value, ttl) {
        return new Promise((resolve, reject) => {
            if (ttl) {
                this.client.set(key, JSON.stringify(value), "EX", ttl, (error) => {
                    if (error) {
                        this.logger.error(error.stack || error.message || error)

                        reject(error)
                    } else {
                        resolve()
                    }
                })
            } else {
                this.client.set(key, JSON.stringify(value), (error) => {
                    if (error) {
                        this.logger.error(error.stack || error.message || error)

                        reject(error)
                    } else {
                        resolve()
                    }
                })
            }
        })
    }
}

module.exports = RedisDataProvider
