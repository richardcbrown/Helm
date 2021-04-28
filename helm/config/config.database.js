/** @typedef {import("./types").DatabaseConfiguration} DatabaseConfiguration */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<DatabaseConfiguration>} */
async function getConfig() {
    const data = {
        host: await secretManager.getSecret("PGHOST"),
        port: await secretManager.getSecret("PGPORT"),
        database: await secretManager.getSecret("PGDATABASE"),
        user: await secretManager.getSecret("PGUSER"),
        password: await secretManager.getSecret("PGPASSWORD"),
        schema: await secretManager.getSecret("PGSCHEMA"),
    }

    return data
}

module.exports = getConfig
