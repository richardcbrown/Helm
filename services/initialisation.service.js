/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

/** @type {ServiceSchema} */
const InitialisationService = {
    name: "initialisationservice",
    actions: {
        //initialise: initialisationHandler,
    },
}

module.exports = InitialisationService
