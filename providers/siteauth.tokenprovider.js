/** @typedef {import("openid-client").TokenSet} TokenSet */
/** @typedef {import("../config/types").SiteAuthConfiguration} SiteAuthConfiguration */

const jwt = require("jwt-simple")
const moment = require("moment")
const { v4 } = require("uuid")
const { MoleculerError } = require("moleculer").Errors
const ExtractJwt = require("passport-jwt").ExtractJwt

class SiteAuthTokenProvider {
    /** @param {SiteAuthConfiguration} configuration */
    constructor(configuration, tokenDataClient) {
        this.configuration = configuration
        this.tokenDataClient = tokenDataClient
    }

    /**
     * Generates a site jwt with configured secret and expiry
     * @public
     * @param {TokenSet} tokenSet
     * @returns {Promise<{ payload: any, token: string }>} jwt
     */
    async generateSiteToken(tokenSet) {
        const {
            publicKey,
            privateKey,
            jwtExpiry,
            jwtSigningAlgorithm,
            issuer,
            audience,
            nhsNumberMap,
        } = this.configuration

        const idToken = tokenSet.id_token

        if (!idToken) {
            throw new MoleculerError("Id token not found in token set", 403)
        }

        const decodedId = jwt.decode(idToken, null, true)

        const iat = decodedId.iat || Math.floor(Date.now() / 1000)
        const exp = jwtExpiry ? iat + jwtExpiry : decodedId.exp
        const jti = v4()

        let nhsNumber = decodedId.nhs_number.split(" ").join("")

        if (nhsNumberMap && nhsNumberMap[nhsNumber]) {
            nhsNumber = nhsNumberMap[nhsNumber]
        }

        await this.tokenDataClient.addToken(jti, iat, exp)

        const tokenPayload = {
            jti,
            iat,
            exp,
            iss: issuer,
            aud: audience,
            role: "phrUser",
            sub: nhsNumber,
        }

        return { payload: tokenPayload, token: jwt.encode(tokenPayload, privateKey, jwtSigningAlgorithm) }
    }

    async generateSiteTokenInternal(payload) {
        const { privateKey, jwtSigningAlgorithm } = this.configuration

        return { payload: payload, token: jwt.encode(payload, privateKey, jwtSigningAlgorithm) }
    }

    async revokeSiteToken(token) {
        const payload = jwt.decode(token)

        const { jti } = payload

        if (!jti) {
            throw new MoleculerError("Invalid token", 403)
        }

        await this.tokenDataClient.revokeToken(jti)
    }

    generateTestSiteToken(nhsNumber) {
        const { privateKey, jwtExpiry, jwtSigningAlgorithm, issuer, audience } = this.configuration

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

        return { payload: tokenPayload, token: jwt.encode(tokenPayload, privateKey, jwtSigningAlgorithm) }
    }

    /**
     * @private
     * @param {Request} [request]
     * Extracts the token from the request
     */
    extractTokenFromRequest(request) {
        return ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    /**
     * Returns options for the jwt verify strategy
     * @public
     */
    getSiteTokenStrategyOptions() {
        const { publicKey, issuer, audience } = this.configuration

        return {
            jwtFromRequest: this.extractTokenFromRequest(),
            secretOrKey: publicKey,
            ignoreExpies: false,
            issuer,
            audience,
        }
    }
}

module.exports = SiteAuthTokenProvider
