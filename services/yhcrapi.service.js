/**
 * The yhcrapiservice's sole purpose is to provide DataProvider capability to Helm
 * to surface resources to the YHCR.
 *
 * Because of the nature of the endpoint, it has been separated out from the rest of
 * the services to make sure adequate security is always provided.
 */

/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer-web")} MoleculerWeb */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */

const ApiService = require("moleculer-web")
const request = require("request-promise-native")
const getYhcrAuthConfig = require("../config/config.yhcrauth")

const yhcrAuthHandler = async (req, res, next) => {
    const unauthorised = (response) => {
        response.writeHead(403)
        response.end()
    }

    try {
        const auth = req.headers["authorization"]

        if (!auth) {
            return unauthorised(res)
        }

        const access_token = auth.split("Bearer ")[1]

        if (!access_token) {
            return unauthorised(res)
        }

        const { host, clientId, clientSecret } = await getYhcrAuthConfig()

        const options = {
            method: "POST",
            uri: host,
            json: true,
            body: {
                access_token: auth,
            },
            simple: false,
            resolveWithFullResponse: true,
            auth: {
                user: clientId,
                pass: clientSecret,
            },
        }

        var result = await request(options)

        if (result.statusCode === 200) {
            if (result.body.token_valid === 1) {
                return next()
            }
        }

        return unauthorised(res)
    } catch (error) {
        return unauthorised(res)
    }
}

/** @type {ServiceSchema} */
const ApiGateway = {
    name: "yhcrapiservice",
    mixins: [ApiService],
    settings: {
        port: 8090,
        routes: [
            {
                path: "/fhir/stu3",
                use: [yhcrAuthHandler],
                aliases: {
                    "GET /:resourceType": "internalfhirservice.search",
                    "GET /:resourceType/:resourceId": "internalfhirservice.read",
                },
                onBeforeCall(ctx, route, req, res) {
                    ctx.meta.user = {
                        role: "YHCR",
                    }
                },
            },
        ],
        onError(req, res, err) {
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Error" }))
        },
    },
}

module.exports = ApiGateway
