const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

async function getConfig() {
    return {
        api: {
            host: await secretManager.getSecret("REPOSITORY_HOST"),
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
