/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const OidcProvider = require("../providers/oidc.provider")
const request = require("request-promise-native")
const passport = require("passport")
const ApiService = require("moleculer-web")
const cookieParser = require("cookie-parser")
const JwtStrategy = require("passport-jwt").Strategy

const SiteTokenProvider = require("../providers/siteauth.tokenprovider")
const getSiteAuthConfiguration = require("../config/config.siteauth")
const { populateContextWithUser, checkUserConsent, PatientNotConsentedError } = require("../handlers/handler.helpers")
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

/**
 *
 * @param {import("../config/types").OidcProviderConfiguration} configuration
 */
const systemAuthHandler = (configuration) => async (req, res, next) => {
    const unauthorised = (res) => {
        res.writeHead(401)
        res.end()
    }

    try {
        const auth = req.headers.authorization

        if (!auth) {
            return unauthorised(res)
        }

        const token = auth.split(" ")[1]

        /** @type {Options} */
        /** @type {Options} */
        let options = {
            url: `${configuration.issuer}${configuration.verifyUrl}`,
            method: "POST",
            headers: {
                authorization: `Basic ${Buffer.from(
                    `${configuration.verifyClientId}:${configuration.verifyClientSecret}`
                ).toString("base64")}`,
            },
            form: {
                token,
            },
            simple: false,
            json: true,
            resolveWithFullResponse: true,
        }

        const response = await request(options)

        const result = response.body

        if (!result.active) {
            unauthorised(res)
        } else {
            next()
        }
    } catch (error) {
        next(error)
    }
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

const fhirStoreVerify = (req, res, next) => {
    const { access_token } = {}
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
                use: [fhirStoreVerify],
            },
            {
                path: "/api/hscn",
                use: [systemAuthHandler(getOidcProviderConfiguration())],
                aliases: {
                    "GET /:site/top3Things/:patientId": "externalservice.topThreeThings",
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
                    await checkUserConsent(ctx, res)
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
                    await checkUserConsent(ctx, res)

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
            } else {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: "Error" }))
            }
        },
    },
}

module.exports = ApiGateway
