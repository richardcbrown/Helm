/**
 * Author: Richard Brown
 *
 * OIDC-Client port from QEWD to Moleculer
 *
 * @todo getRedirect handler - redirect handler base implementation complete
 * @todo logout handler
 * @todo oidc_callback handler - callback handler basic implmentation complete
 * @todo proper handling of nonce and state auth parameters - are these required outside mock nhs login?
 * @todo nhsNumber extraction
 */

/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const provisionClient = require("../clients/oidc.client")
const getOidcConfiguration = require("../config/config.oidcclient")

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")

/**
 * Handle logout
 * At present NHS Login only, does not have
 * end session mechanism
 * redirect back to login
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function logoutHandler(ctx) {
    const { logger } = this

    const client = await provisionClient(getOidcConfiguration())

    return {
        redirectURL: client.getRedirectUrl(),
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function getRedirectHandler(ctx) {
    const { logger } = this

    const client = await provisionClient(getOidcConfiguration())

    return {
        redirectURL: client.getRedirectUrl(),
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function callbackHandler(ctx) {
    const { logger } = this

    const { code, state } = ctx.params

    const client = await provisionClient(getOidcConfiguration())

    const tokenSet = await client.authorisationCallback({ code, state })

    const tokenProvider = new SiteTokenProvider(getSiteAuthConfiguration())

    const token = tokenProvider.generateSiteToken(tokenSet)

    ctx.meta.$responseHeaders = {
        "Set-Cookie": `JSESSIONID=${token}; Path=/;`,
    }

    ctx.meta.$location = "/"
    ctx.meta.$statusCode = 302
}

/** @type {ServiceSchema} */
const OidcClientService = {
    name: "oidcclientservice",
    actions: {
        getRedirect: getRedirectHandler,
        callback: callbackHandler,
        logout: logoutHandler,
    },
}

module.exports = OidcClientService
