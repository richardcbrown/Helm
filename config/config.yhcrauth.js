function getConfig() {
    return {
        host: process.env.YHCR_VERIFY_URL,
        clientId: process.env.YHCR_VERIFY_CLIENTID,
        clientSecret: process.env.YHCR_VERIFY_CLIENTSECRET,
    }
}

module.exports = getConfig
