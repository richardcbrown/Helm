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
const getOidcConfiguration = require("../config/config.oidc")

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function getRedirectHandler(ctx) {
    const { logger } = this

    const client = await provisionClient(getOidcConfiguration())

    // ctx.meta.$statusCode = 301
    // ctx.meta.$location = client.getRedirectUrl()

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
    },
}

module.exports = OidcClientService
