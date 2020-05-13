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
     * @returns {string} jwt
     */
    generateSiteToken(tokenSet) {
        const { jwtSigningSecret, jwtExpiry, jwtSigningAlgorithm, issuer, audience } = this.configuration

        const idToken = tokenSet.id_token

        if (!idToken) {
            throw Error("Id token not found in token set")
        }

        const decodedId = jwt.decode(idToken, null, true)

        const iat = decodedId.iat || new Date().getTime()
        const exp = jwtExpiry ? moment(iat).add(jwtExpiry, "s").toDate().getTime() : decodedId.exp

        const tokenPayload = {
            iat,
            exp,
            iss: issuer,
            aud: audience,
            role: "phrUser",
            sub: decodedId.nhs_number.split(" ").join(""),
        }

        return jwt.encode(tokenPayload, jwtSigningSecret, jwtSigningAlgorithm)
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
            issuer,
            audience,
        }
    }
}

module.exports = SiteAuthTokenProvider
