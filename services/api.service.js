/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const OidcProvider = require("../providers/oidc.provider")
const request = require("request-promise-native")
const passport = require("passport")
const ApiService = require("moleculer-web")
const cookieParser = require("cookie-parser")
const JwtStrategy = require("passport-jwt").Strategy
const bodyParser = require("body-parser")

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")
const {
    populateContextWithUser,
    checkUserConsent,
    PatientNotConsentedError,
    populateContextWithUserReference,
} = require("../handlers/handler.helpers")
const getDatabaseConfiguration = require("../config/config.database")
const getOidcProviderConfiguration = require("../config/config.oidcprovider")
const getSequelizeAdapter = require("../adapters/oidcsequelize.adapter")

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

/** @typedef {import("request-promise-native").RequestPromiseOptions} RequestPromiseOptions */
/** @typedef {import("request-promise-native").Options} Options */

const userAuthInitialiseHandler = (req, res, next) => {
    passport.authenticate("jwt", (error, user, info) => {
        //not authenticated, redirect
        if (error || info instanceof Error) {
            res.writeHead(301, { Location: "/auth/redirect", "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Login Expired" }))
        } else {
            req.user = user
            next()
        }
    })(req, res, next)
}

const verify = async (req, res) => {
    const { access_token } = req.body

    try {
        const result = await request({
            uri: "http://localhost:8080/token/introspection",
            method: "POST",
            headers: {
                authorization: req.headers.authorization,
            },
            form: {
                token: access_token.split(" ")[1],
            },
            json: true,
        })

        const token_payload = {
            rsn: "5",
        }

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ token_valid: result.active ? 1 : 0, token_payload }))
    } catch (error) {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ token_valid: 0 }))
    }
}

const headerCheck = (req, res, next) => {
    const { headers } = req

    const requestedWith = headers["x-requested-with"]

    if (!requestedWith || requestedWith !== "XMLHttpRequest") {
        res.writeHead(403, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Unauthorised" }))
        return
    }

    next()
}

const provider = new OidcProvider(getOidcProviderConfiguration(), getSequelizeAdapter(getDatabaseConfiguration()))

/** @type {ServiceSchema} */
const ApiGateway = {
    name: "apiservice",
    mixins: [ApiService],
    settings: {
        port: 8080,
        routes: [
            {
                path: "/test",
                use: [bodyParser.urlencoded()],
                aliases: {
                    "POST /token": async (req, res) => {
                        try {
                            const result = await request({
                                uri: "http://localhost:8080/token",
                                method: "POST",
                                headers: { ...req.headers },
                                form: {
                                    ...req.body,
                                },
                                json: true,
                            })

                            if (!result.access_token || result.scope !== "test") {
                                res.writeHead(403)
                                res.end()
                                return
                            }

                            const tokenProvider = new SiteTokenProvider(getSiteAuthConfiguration())

                            const { token } = tokenProvider.generateTestSiteToken(req.body.nhsNumber)

                            req.$ctx.call("jobservice.patientlogin", {
                                token: result.access_token,
                                nhsNumber: req.body.nhsNumber,
                            })

                            res.writeHead(200, { "Content-Type": "application/json" })
                            res.end(JSON.stringify({ token }))
                        } catch (error) {
                            res.writeHead(403)
                            res.end()
                        }
                    },
                    "POST /token/yhcr": async (req, res) => {
                        try {
                            const result = await request({
                                uri: "http://localhost:8080/token",
                                method: "POST",
                                headers: { ...req.headers },
                                form: {
                                    ...req.body,
                                },
                                json: true,
                            })

                            if (!result.access_token || result.scope !== "test") {
                                res.writeHead(403)
                                res.end()
                                return
                            }

                            res.writeHead(200, { "Content-Type": "application/json" })
                            res.end(JSON.stringify({ token: result.access_token }))
                        } catch (error) {
                            res.writeHead(403)
                            res.end()
                        }
                    },
                },
            },
            {
                path: "/auth",
                aliases: {
                    "GET /redirect": "oidcclientservice.getRedirect",
                    "GET /token": "oidcclientservice.callback",
                    "GET /logout": "oidcclientservice.logout",
                },
            },
            {
                path: "/",
                use: [provider.getProvider()],
            },
            {
                path: "/verify",
                aliases: {
                    "POST /token": verify,
                },
                bodyParsers: {
                    json: true,
                },
            },
            {
                path: "/api",
                use: [headerCheck, cookieParser(), passport.initialize(), userAuthInitialiseHandler],
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
                use: [headerCheck, cookieParser(), passport.initialize(), userAuthHandler],
                async onBeforeCall(ctx, route, req, res) {
                    populateContextWithUser(ctx, req)
                    await checkUserConsent(ctx)
                    await populateContextWithUserReference(ctx, req)
                },
                aliases: {
                    "GET /demographics": "demographicsservice.demographics",
                    "GET /repository": "repositoryservice.search",
                },
            },
            {
                path: "/api/patient/fhir",
                use: [headerCheck, cookieParser(), passport.initialize(), userAuthHandler, bodyParser.json()],
                async onBeforeCall(ctx, route, req, res) {
                    populateContextWithUser(ctx, req)
                    await checkUserConsent(ctx)
                    await populateContextWithUserReference(ctx, req)

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
            {
                path: "/test",
                aliases: {
                    "GET jobs/:nhsNumber/:token": "jobservice.patientlogin",
                },
            },
        ],
        onError(req, res, err) {
            if (err instanceof PatientNotConsentedError) {
                res.writeHead(200, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ status: "sign_terms" }))
            } else if (err.code) {
                res.writeHead(err.code, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: err.message }))
            } else {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: "Error" }))
            }
        },
    },
}

module.exports = ApiGateway
