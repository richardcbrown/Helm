/** @typedef {import("moleculer").Context<any, any>} Context */

const { MoleculerError } = require("moleculer").Errors

/**
 * Checks user is present and has subject
 * @param {Context} ctx
 */
function checkUserSub(ctx) {
    if (!ctx.meta.user || !ctx.meta.user.role || !ctx.meta.user.sub) {
        throw new MoleculerError("Forbidden", 403)
    }
}

/**
 * Checks user has correct role
 * @param {Context} ctx
 */
function checkUserRole(ctx) {
    if (!ctx.action) {
        throw new MoleculerError("Action not set", 403)
    }

    if (ctx.meta.user.role !== ctx.action.role) {
        throw new MoleculerError("User does not have the required role", 403)
    }
}

const phrUserCheckHooks = [checkUserSub, checkUserRole]

module.exports = { checkUserSub, checkUserRole, phrUserCheckHooks }
