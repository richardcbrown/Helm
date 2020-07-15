/** @typedef {import("openid-client").TokenSet} TokenSet */
/** @typedef {import("../config/types").SiteAuthConfiguration} SiteAuthConfiguration */

const jwt = require("jwt-simple")
const moment = require("moment")

class SiteAuthTokenProvider {
    /** @param {SiteAuthConfiguration} configuration */
    constructor(configuration) {
        this.configuration = configuration
    }

    /**
     * Generates a site jwt with configured secret and expiry
     * @public
     * @param {TokenSet} tokenSet
     * @returns {{ payload: any, token: string }} jwt
     */
    generateSiteToken(tokenSet) {
        const { jwtSigningSecret, jwtExpiry, jwtSigningAlgorithm, issuer, audience } = this.configuration

        const idToken = tokenSet.id_token

        if (!idToken) {
            throw Error("Id token not found in token set")
        }

        const decodedId = jwt.decode(idToken, null, true)

        const iat = decodedId.iat || Math.floor(Date.now() / 1000)
        const exp = jwtExpiry ? iat + jwtExpiry : decodedId.exp

        const tokenPayload = {
            iat,
            exp,
            iss: issuer,
            aud: audience,
            role: "phrUser",
            sub: decodedId.nhs_number.split(" ").join(""),
        }

        return { payload: tokenPayload, token: jwt.encode(tokenPayload, jwtSigningSecret, jwtSigningAlgorithm) }
    }

    generateTestSiteToken(nhsNumber) {
        const { jwtSigningSecret, jwtExpiry, jwtSigningAlgorithm, issuer, audience } = this.configuration

        const iat = Math.floor(Date.now() / 1000)
        const exp = iat + jwtExpiry

        const tokenPayload = {
            iat,
            exp,
            iss: issuer,
            aud: audience,
            role: "phrUser",
            sub: nhsNumber,
        }

        return { payload: tokenPayload, token: jwt.encode(tokenPayload, jwtSigningSecret, jwtSigningAlgorithm) }
    }

    /**
     * @private
     * @param {Request} request
     * @returns {string | null}
     * Extracts the token from the request
     */
    extractTokenFromRequest(request) {
        return (request && request.cookies["JSESSIONID"]) || null
    }

    /**
     * Returns options for the jwt verify strategy
     * @public
     */
    getSiteTokenStrategyOptions() {
        const { jwtSigningSecret, issuer, audience } = this.configuration

        return {
            jwtFromRequest: this.extractTokenFromRequest,
            secretOrKey: jwtSigningSecret,
            ignoreExpies: false,
            issuer,
            audience,
        }
    }
}

module.exports = SiteAuthTokenProvider
