/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const passport = require("passport")
const ApiService = require("moleculer-web")

const cookieParser = require("cookie-parser")
const JwtStrategy = require("passport-jwt").Strategy

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")
const { populateContextWithUser } = require("../handlers/handler.helpers")

passport.use(
    new JwtStrategy(new SiteTokenProvider(getSiteAuthConfiguration()).getSiteTokenStrategyOptions(), function (
        jwtPayload,
        done
    ) {
        done(null, jwtPayload)
    })
)

const userAuthHandler = (req, res, next) => {
    passport.authenticate("jwt", (error, user, info) => {
        //not authenticated, redirect
        if (error || info instanceof Error) {
            res.writeHead(301, { Location: "/auth/redirect" })
            res.end()
        } else {
            req.user = user
            next()
        }
    })(req, res, next)
}

/** @type {ServiceSchema} */
const ApiGateway = {
    name: "apiservice",
    mixins: [ApiService],
    settings: {
        port: 8080,
        routes: [
            {
                path: "/auth",
                aliases: {
                    "GET /redirect": "oidcclientservice.getRedirect",
                    "GET /token": "oidcclientservice.callback",
                    "GET /logout": "oidcclientservice.logout",
                },
            },
            {
                path: "/api",
                use: [cookieParser(), passport.initialize(), userAuthHandler],
                async onBeforeCall(ctx, route, req, res) {
                    populateContextWithUser(ctx, req)
                },
                bodyParsers: {
                    json: true,
                },
                aliases: {
                    "GET /initialise": "consentservice.initialise",
                    "GET /initialise/terms": "consentservice.getTerms",
                    "GET /initialise/terms/check": "consentservice.check",
                    "POST /initialise/terms/accept": "consentservice.acceptTerms",
                },
            },
            {
                path: "/api",
                use: [cookieParser(), passport.initialize(), userAuthHandler],
                async onBeforeCall(ctx, route, req, res) {
                    populateContextWithUser(ctx, req)

                    const consented = await ctx.call("consentservice.patientConsented")

                    if (consented) {
                        return
                    }

                    res.writeHead(200, { "Content-Type": "application/json" })
                    res.end(JSON.stringify({ status: "sign_terms" }))
                },
                aliases: {
                    "GET /demographics": "demographicsservice.demographics",
                },
            },
        ],
    },
}

module.exports = ApiGateway
