function getConfig() {
    const mock =
        (process.env.NHS_LOGIN_INTROSPECTION_MOCK && Boolean(process.env.NHS_LOGIN_INTROSPECTION_MOCK)) || false

    return {
        host: process.env.NHS_LOGIN_INTROSPECTION_URL,
        mock,
        nhsNumberMap: {
            "9999999801": "9449303983",
        },
    }
}

module.exports = getConfig
