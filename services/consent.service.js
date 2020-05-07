/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const PatientConsentProvider = require("../providers/patientconsent.provider")
const getConsentConfig = require("../config/config.consent")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<boolean>}
 * */
async function patientConsentedHandler(ctx) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())

    /** @type {number | string} */
    const nhsNumber = ctx.params.nhsNumber

    return await patientConsentProvider.patientHasConsented(nhsNumber)
}

/**
 * Manages general operations
 * around user consent
 * @type {ServiceSchema}
 */
const ConsentService = {
    name: "consentservice",
    actions: {
        patientConsented: patientConsentedHandler,
    },
}

module.exports = ConsentService
