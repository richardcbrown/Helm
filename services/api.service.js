/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const ApiService = require("moleculer-web")

/** @type {ServiceSchema} */
const ApiGateway = {
    name: "apiservice",
    mixins: [ApiService],
    settings: {
        port: 3000,
        routes: [
            {
                path: "",
                aliases: {
                    "GET /test": "fhirservice.test",
                },
            },
        ],
    },
}

module.exports = ApiGateway
