/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

/** @typedef {import("../models/types").Demographics} Demographics */

const DemographicsProvider = require("../providers/demographics.provider")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<Demographics>}
 * */
async function getDemographicsHandler(ctx) {
    const demographicsProvider = new DemographicsProvider()

    return demographicsProvider.demographics(ctx)
}

/** @type {ServiceSchema} */
const DemographicsService = {
    name: "demographicsservice",
    actions: {
        demographics: {
            params: {
                nhsNumber: { type: "string" },
            },
            handler: getDemographicsHandler,
        },
    },
}

module.exports = DemographicsService
