/** @typedef {import("moleculer").Context<any, any>} Context */

/**
 * Gets the user sub from context
 * (usually nhsNumber)
 * @param {Context} ctx
 * @returns {string | number} sub
 */
function getUserSubFromContext(ctx) {
    if (!ctx.meta.user || !ctx.meta.user.role || !ctx.meta.user.sub) {
        throw Error("Sub not set")
    }

    return ctx.meta.user.sub
}

/**
 * Populates user information from request into context
 * @param {Context} ctx
 * @param {Request} req
 */
function populateContextWithUser(ctx, req) {
    // Set request headers to context meta
    if (!req.user || !req.user.sub || !req.user.role) {
        throw Error("User has not been populated")
    }

    ctx.meta.user = {
        sub: req.user.sub,
        role: req.user.role,
    }
}

/**
 * Populates user information from request into context
 * @param {Context} ctx
 * @param {Response} res
 */
async function checkUserConsent(ctx, res) {
    const consented = await ctx.call("consentservice.patientConsented")

    if (consented) {
        return
    }

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "sign_terms" }))
}

module.exports = { getUserSubFromContext, populateContextWithUser, checkUserConsent }