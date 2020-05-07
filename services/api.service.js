/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const ApiService = require("moleculer-web")

/** @type {ServiceSchema} */
const ApiGateway = {
    name: "apiservice",
    mixins: [ApiService],
    settings: {
        port: 8080,
        routes: [
            {
                path: "",
                aliases: {
                    "GET /test": "fhirservice.test",
                    "GET /demographics/:nhsNumber": "demographicsservice.demographics",
                    "GET /redirect": "oidcclientservice.getRedirect",
                    "GET /token": "oidcclientservice.callback",
                },
            },
        ],
    },
}

module.exports = ApiGateway
