/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const passport = require("passport")
const ApiService = require("moleculer-web")

const cookieParser = require("cookie-parser")
const JwtStrategy = require("passport-jwt").Strategy
const CustomStrategy = require("passport-custom").Strategy

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")

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

        //next()
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
                },
            },
            {
                path: "/api",
                use: [cookieParser(), passport.initialize(), userAuthHandler],
                bodyParsers: {
                    json: true,
                },
                aliases: {
                    "GET /initialise": "consentservice.initialise",
                    "GET /initialise/terms": "consentservice.getTerms",
                    "GET /initialise/terms/check": "consentservice.getTerms",
                    "POST /initialise/terms/accept": "consentservice.check",
                },
            },
            {
                path: "/api",
                use: [cookieParser(), passport.initialize(), userAuthHandler],
                async onBeforeCall(ctx, route, req, res) {
                    // Set request headers to context meta
                    if (!req.user || !req.user.sub || !req.user.role) {
                        throw Error("User has not been populated")
                    }

                    ctx.meta.user = {
                        sub: req.user.sub,
                        role: req.user.role,
                    }

                    console.log("on-before")

                    const consented = await ctx.call("consentservice.patientConsented")

                    console.log(consented)
                },
                aliases: {
                    "GET /test": "fhirservice.test",
                    "GET /demographics": "demographicsservice.demographics",
                },
            },
        ],
    },
}

module.exports = ApiGateway
