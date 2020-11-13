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

const connectionPool = new pg.Pool()
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
    const { jti, id, sub } = ctx.meta.user

    const tokenDataClient = new TokenDataClient(connectionPool)
    const userDataClient = new UserDataClient(connectionPool)

    const user = await userDataClient.getUserByNhsNumber(sub)

    if (!user) {
        throw Error(`User ${sub} not found`)
    }

    const token = await tokenDataClient.getToken(jti)

    if (!token) {
        throw Error(`Token ${jti} does not exist`)
    }

    const sessionDuration = user.lastLogin ? moment.duration(moment(moment.now()).diff(user.lastLogin)) : null

    await tokenDataClient.revokeToken(jti)

    if (sessionDuration) {
        ctx.call("metricsservice.sessionDuration", {
            duration: sessionDuration.asSeconds(),
            sessionId: jti,
            userId: user.id,
        })
    }

    if (token.totalPages <= 1) {
        ctx.call("metricsservice.bouncedSession", { sessionId: jti, userId: user.id })
    }

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
async function callbackHandler(ctx) {
    const { logger } = this

    //const loggingClient = new LoggingClient("user-metrics")
    //const monitoringClient = new MonitoringClient()

    // loggingClient.logEntry()
    // monitoringClient.monitor()

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
