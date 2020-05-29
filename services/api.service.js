/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const passport = require("passport")
const ApiService = require("moleculer-web")

const cookieParser = require("cookie-parser")
const JwtStrategy = require("passport-jwt").Strategy

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")
const { populateContextWithUser, checkUserConsent } = require("../handlers/handler.helpers")

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
            res.writeHead(403, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Login Expired" }))
        } else {
            req.user = user
            next()
        }
    })(req, res, next)
}

const userAuthInitialiseHandler = (req, res, next) => {
    passport.authenticate("jwt", (error, user, info) => {
        //not authenticated, redirect
        if (error || info instanceof Error) {
            res.writeHead(301, { Location: "/auth/redirect" })
            res.end(JSON.stringify({ error: "Login Expired" }))
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
                use: [cookieParser(), passport.initialize(), userAuthInitialiseHandler],
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
                    checkUserConsent(ctx, res)
                },
                aliases: {
                    "GET /demographics": "demographicsservice.demographics",
                },
            },
            {
                path: "/api/patient/fhir",
                use: [cookieParser(), passport.initialize(), userAuthHandler],
                async onBeforeCall(ctx, route, req, res) {
                    populateContextWithUser(ctx, req)
                    checkUserConsent(ctx, res)

                    req.$params = {
                        resource: req.$params.body,
                        ...req.$params.query,
                        ...req.$params.params,
                    }
                },
                mergeParams: false,
                bodyParsers: {
                    json: true,
                },
                aliases: {
                    "POST /:resourceType": "patientfhirservice.create",
                    "GET /:resourceType": "patientfhirservice.search",
                    "GET /:resourceType/:resourceId": "patientfhirservice.read",
                },
            },
        ],
    },
}

module.exports = ApiGateway
