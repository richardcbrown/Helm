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
const pg = require("pg")
const TokenDataClient = require("../clients/token.dataclient")
const UserDataClient = require("../clients/user.dataclient")
const moment = require("moment")
const getDatabaseConfiguration = require("../config/config.database")

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
    const { jti } = ctx.meta.user

    await ctx.call("jobservice.revokeOldToken", { jti })

    const oidcConfig = await getOidcConfiguration()

    const client = await provisionClient(oidcConfig)

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

    const oidcConfig = await getOidcConfiguration()

    const client = await provisionClient(oidcConfig)

    return {
        redirectURL: client.getRedirectUrl(),
    }
}

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<void>}
 * */
async function callbackHandler(ctx, connectionPool) {
    const { logger } = this

    const { code, state } = ctx.params

    const oidcConfig = await getOidcConfiguration()
    const authConfig = await getSiteAuthConfiguration()

    const client = await provisionClient(oidcConfig)

    const tokenSet = await client.authorisationCallback({ code, state })

    const tokenProvider = new SiteTokenProvider(authConfig, new TokenDataClient(connectionPool))

    const { payload, token } = await tokenProvider.generateSiteToken(tokenSet)

    ctx.call("jobservice.patientlogin", { token: tokenSet.access_token, nhsNumber: payload.sub })

    ctx.meta.$responseHeaders = {
        "Set-Cookie": `JSESSIONID=${token}; Path=/;`,
    }

    ctx.meta.$location = "/#/login"
    ctx.meta.$statusCode = 302
}

/**
 * Updates the token activity
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function tokenActiveHandler(ctx, connectionPool) {
    const { logger } = this
    const { jti } = ctx.meta.user

    const tokenDataClient = new TokenDataClient(connectionPool)

    const now = moment(moment.now()).seconds()

    tokenDataClient.updateTokenActive(jti, now)
}

/** @type {ServiceSchema} */
const OidcClientService = {
    name: "oidcclientservice",
    actions: {
        getRedirect: getRedirectHandler,
        callback: {
            handler(ctx) {
                return callbackHandler(ctx, this.connectionPool)
            },
        },
        logout: {
            handler(ctx) {
                return logoutHandler(ctx)
            },
        },
        tokenActive: {
            handler(ctx) {
                return tokenActiveHandler(ctx, this.connectionPool)
            },
        },
    },
    async started() {
        const config = await getDatabaseConfiguration()

        this.connectionPool = new pg.Pool(config)
    },
}

module.exports = OidcClientService
