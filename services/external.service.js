/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const { TopThreeThingsProvider } = require("../providers/topthreethings.provider")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<fhir.Composition | null>}
 * */
async function getTopThreeThingsHandler(ctx) {
    const nhsNumber = ctx.params.nhsNumber

    const topThreeThingsProvider = new TopThreeThingsProvider(ctx)

    return topThreeThingsProvider.getTopThreeThings(nhsNumber)
}

/** @type {ServiceSchema} */
const ExternalService = {
    name: "externalservice",
    actions: {
        topThreeThings: {
            role: "externalUser",
            handler: getTopThreeThingsHandler,
        },
    },
    hooks: {
        before: {
            "*": [
                (ctx) => {
                    if (ctx.meta.user.role !== ctx.action.role) {
                        throw Error("User does not have the required role")
                    }
                },
            ],
        },
    },
}

module.exports = ExternalService
