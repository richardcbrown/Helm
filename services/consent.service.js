/**
 * Consent Moleculer Service
 * @todo Proper handling of nhsNumber when posting consent
 */

/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const PatientConsentProvider = require("../providers/patientconsent.provider")
const PatientConsentGenerator = require("../generators/patientconsent.generator")
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
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function initialiseHandler(ctx) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())

    /** @type {number | string} */
    const nhsNumber = 9657702151 //ctx.params.nhsNumber

    const consent = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (!consent) {
        return { status: "sign_terms" }
    } else {
        return { status: "login" }
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<{ resources: fhir.Resource[] }>}
 * */
async function getTermsHandler(ctx) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())

    const policies = await patientConsentProvider.getPolicies()

    return { resources: policies }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function acceptTermsHandler(ctx) {
    const patientConsentProvider = new PatientConsentProvider(ctx, getConsentConfig())
    const patientConsentGenerator = new PatientConsentGenerator(ctx, getConsentConfig())

    /** @type {number | string} */
    const nhsNumber = 9657702151 //ctx.params.nhsNumber

    /** @type {fhir.Resource[]} */
    const policies = [ctx.params["0"], ctx.params["1"]]

    await patientConsentGenerator.generatePatientConsent(nhsNumber, policies)

    const consent = await patientConsentProvider.patientHasConsented(nhsNumber)

    if (!consent) {
        return { status: "sign_terms" }
    } else {
        return { status: "login" }
    }
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
        check: initialiseHandler,
        initialise: initialiseHandler,
        getTerms: getTermsHandler,
        acceptTerms: acceptTermsHandler,
    },
}

module.exports = ConsentService
