/** @typedef {import("./types").DatabaseConfiguration} DatabaseConfiguration */

/** @returns {DatabaseConfiguration} */
function getConfig() {
    return {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        schema: process.env.PGSCHEMA,
    }
}

module.exports = getConfig
