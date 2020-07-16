/** @typedef {import("./types").DatabaseConfiguration} DatabaseConfiguration */

const SecretManager = require("./config.secrets")

const secretManager = new SecretManager(process.env.GCP_PROJECT_ID)

/** @returns {Promise<DatabaseConfiguration>} */
async function getConfig() {
    return {
        host: await secretManager.getSecret("PGHOST"),
        port: await secretManager.getSecret("PGPORT"),
        database: await secretManager.getSecret("PGDATABASE"),
        username: await secretManager.getSecret("PGUSER"),
        password: await secretManager.getSecret("PGPASSWORD"),
        schema: await secretManager.getSecret("PGSCHEMA"),
    }
}

module.exports = getConfig
