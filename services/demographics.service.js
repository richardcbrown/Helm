/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

/** @typedef {import("../models/types").Demographics} Demographics */

const DemographicsProvider = require("../providers/demographics.provider")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<{ demographics: Demographics }>}
 * */
async function getDemographicsHandler(ctx) {
    const nhsNumber = ctx.meta.user.sub

    const demographicsProvider = new DemographicsProvider()

    return { demographics: await demographicsProvider.demographics(nhsNumber, ctx) }
}

/** @type {ServiceSchema} */
const DemographicsService = {
    name: "demographicsservice",
    actions: {
        demographics: {
            role: "phrUser",
            handler: getDemographicsHandler,
        },
    },
    hooks: {
        before: {
            "*": [
                (ctx) => {
                    if (!ctx.meta.user || !ctx.meta.user.role || !ctx.meta.user.sub) {
                        throw Error("Forbidden")
                    }
                },
                (ctx) => {
                    if (ctx.meta.user.role !== ctx.action.role) {
                        throw Error("User does not have the required role")
                    }
                },
            ],
        },
    },
}

module.exports = DemographicsService
