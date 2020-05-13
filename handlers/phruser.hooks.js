/** @typedef {import("moleculer").Context<any, any>} Context */

/**
 * Checks user is present and has subject
 * @param {Context} ctx
 */
function checkUserSub(ctx) {
    if (!ctx.meta.user || !ctx.meta.user.role || !ctx.meta.user.sub) {
        throw Error("Forbidden")
    }
}

/**
 * Checks user has correct role
 * @param {Context} ctx
 */
function checkUserRole(ctx) {
    if (!ctx.action) {
        throw Error("Action not set")
    }

    if (ctx.meta.user.role !== ctx.action.role) {
        throw Error("User does not have the required role")
    }
}

const phrUserCheckHooks = [checkUserSub, checkUserRole]

module.exports = { checkUserSub, checkUserRole, phrUserCheckHooks }
