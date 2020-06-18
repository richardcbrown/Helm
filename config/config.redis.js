function getConfig() {
    return {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
}

module.exports = getConfig
