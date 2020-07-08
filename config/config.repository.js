function getConfig() {
    return {
        api: {
            host: process.env.REPOSITORY_HOST,
            servicePoints: {
                serviceSearch: {
                    endpoint: "services",
                    arguments: {
                        method: "GET",
                    },
                },
                resourceSearch: {
                    endpoint: "resources",
                    arguments: {
                        method: "GET",
                    },
                },
            },
        },
    }
}

module.exports = getConfig
