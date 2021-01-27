/** @typedef {import("../config/types").OidcClientConfiguration} OidcClientConfiguration */
/** @typedef {import("openid-client").Client} Client */
/** @typedef {import("openid-client").Issuer<Client>} Issuer */
/** @typedef {import("openid-client").ClientMetadata} ClientMetadata */
/** @typedef {import("openid-client").AuthorizationParameters} AuthorizationParameters */
/** @typedef {import("openid-client").CallbackParamsType} CallbackParamsType */
/** @typedef {import("jose").JWKS.KeyStore} KeyStore */

const { Issuer } = require("openid-client")
const jose = require("jose")
const { MoleculerError } = require("moleculer").Errors

class OidcClient {
    /** @param {OidcClientConfiguration} configuration */
    constructor(configuration) {
        this.configuration = configuration

        /**
         * @private
         * @type {Issuer | null}
         */
        this.issuer = null

        /**
         * @private
         * @type {KeyStore | null}
         */
        this.keystore = null
    }

    /**
     * initialise oidc client
     * @returns {Promise<void>}
     */
    async init() {
        const { configuration } = this

        if (configuration.defaultHttpOptions) {
            Issuer.defaultHttpOptions = configuration.defaultHttpOptions
        }

        const { oidcProviderHost, urls, tokenEndpointAuthMethod } = configuration
        const {
            authorizationEndpoint,
            tokenEndpoint,
            userInfoEndpoint,
            introspectionEndpoint,
            jwksEndpoint,
            issuer,
        } = urls

        this.issuer = new Issuer({
            issuer: issuer,
            authorization_endpoint: `${oidcProviderHost}${authorizationEndpoint}`,
            token_endpoint: `${oidcProviderHost}${tokenEndpoint}`,
            userinfo_endpoint: `${oidcProviderHost}${userInfoEndpoint}`,
            jwks_uri: `${oidcProviderHost}${jwksEndpoint}`,
        })

        switch (tokenEndpointAuthMethod) {
            case "private_key_jwt": {
                await this.configurePrivateKeyJwt()
                break
            }
            default: {
                break
            }
        }

        this.completeConfiguration()
    }

    /**
     * @private
     * @returns {Promise<void>}
     */
    async configurePrivateKeyJwt() {
        const { configuration } = this
        const { privateKeyFilePath } = configuration

        const privateKey = privateKeyFilePath

        this.keystore = new jose.JWKS.KeyStore()

        await this.keystore.add(jose.JWK.asKey(privateKey))
    }

    /**
     * @private
     */
    completeConfiguration() {
        const { configuration, keystore } = this
        const { clientId, clientSecret, tokenEndpointAuthMethod, tokenEndpointAuthSigningAlg } = configuration

        /**
         * @type {ClientMetadata}
         */
        const clientMetaData = {
            client_id: clientId,
            client_secret: clientSecret,
            token_endpoint_auth_method: tokenEndpointAuthMethod || "client_secret_basic",
        }

        if (tokenEndpointAuthMethod) {
            clientMetaData.token_endpoint_auth_signing_alg = tokenEndpointAuthSigningAlg
            clientMetaData.id_token_signed_response_alg = tokenEndpointAuthSigningAlg
        }

        if (!this.issuer) {
            throw new MoleculerError("Configuration failed", 500)
        }

        this.client = new this.issuer.Client(clientMetaData, (keystore && keystore.toJWKS(true)) || undefined)
    }

    /**
     * Gets the redirect url for login
     * @public
     * @returns {string}
     */
    getRedirectUrl() {
        const { configuration, client } = this
        const { scope, redirectUrl } = configuration

        /**
         * @type {AuthorizationParameters}
         */
        const authParameters = {
            scope: scope.login,
            redirect_uri: redirectUrl,
            prompt: "login",
            nonce: "test",
            state: "test",
        }

        return client.authorizationUrl(authParameters)
    }

    /**
     * Completes authorization callback
     * @param {CallbackParamsType} params
     */
    async authorisationCallback(params) {
        const { client, configuration } = this

        if (!client) {
            throw new MoleculerError("Client does not exist", 403)
        }

        const { redirectUrl } = configuration

        /** @type {CallbackParamsType} */
        const callbackParameters = {
            code: params.code,
            state: params.state,
        }

        const tokenSet = await client.callback(redirectUrl, callbackParameters, { state: "test", nonce: "test" })

        return tokenSet
    }
}

/**
 * Constructs and configures a singleton OidcClient for use
 * @param {OidcClientConfiguration} configuration
 * @returns {Promise<OidcClient>}
 * */
async function provisionClient(configuration) {
    /** @type {OidcClient | null} */
    this.client = this.client || null

    if (this.client) {
        return this.client
    }

    const client = new OidcClient(configuration)

    await client.init()

    this.client = client

    return this.client
}

module.exports = provisionClient
