/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const passport = require("passport")
const ApiService = require("moleculer-web")

const CustomStrategy = require("passport-custom").Strategy

passport.use(
    "custom",
    new CustomStrategy(function (req, done) {
        const authCookie = (req.cookies && req.cookies["JSESSIONID"]) || null

        /**
         * @todo need proper checking of auth cookie
         */
        if (!authCookie) {
            done({ error: "no-cookie" })
        } else {
            done(null)
        }
    })
)

const userAuthHandler = (req, res, next) => {
    passport.authenticate("custom", (error, user, info) => {
        // not authenticated, redirect
        // if (error) {
        //     res.writeHead(301, { Location: "/auth/redirect" })
        //     res.end()
        // } else {
        //     next()
        // }

        next()
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
                use: [passport.initialize(), userAuthHandler],
                bodyParsers: {
                    json: true,
                },
                aliases: {
                    "GET /initialise": "consentservice.initialise",
                    "GET /initialise/terms": "consentservice.getTerms",
                    "POST /initialise/terms/accept": "consentservice.acceptTerms",
                },
            },
            {
                path: "/",
                use: [passport.initialize(), userAuthHandler],
                async onBeforeCall(ctx, route, req, res) {
                    // Set request headers to context meta
                    console.log("on-before")

                    const consented = await ctx.call("consentservice.patientConsented")

                    console.log(consented)
                },
                aliases: {
                    "GET /test": "fhirservice.test",
                    "GET /demographics/:nhsNumber": "demographicsservice.demographics",
                },
            },
        ],
    },
}

module.exports = ApiGateway
