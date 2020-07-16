const { Provider } = require("oidc-provider")

const {
    JWKS: { KeyStore },
    JWK,
} = require("jose")

class OidcProvider {
    /**
     *
     * @param {import("../config/types").OidcProviderConfiguration} configuration
     * @param {import("oidc-provider").AdapterConstructor} adapter
     */
    constructor(configuration, adapter) {
        this.configuration = configuration
        this.adapter = adapter
        this.keystore = new KeyStore()

        const key = configuration.privateKeyFilePath
        this.keystore.add(JWK.asKey(key))

        this.oidc = new Provider(configuration.issuer, {
            adapter: adapter,
            scopes: ["internal", "test"],
            features: {
                registration: {
                    enabled: false,
                },
                clientCredentials: {
                    enabled: true,
                },
                introspection: {
                    enabled: true,
                    async allowedPolicy(ctx, client, token) {
                        const introspectingClient = client.clientId

                        return (
                            client.introspectionEndpointAuthMethod === "none" ||
                            !introspectingClient ||
                            configuration.introspectionAllowedClients.includes(introspectingClient)
                        )
                    },
                },
                devInteractions: {
                    enabled: false,
                },
            },
            jwks: this.keystore.toJWKS(true),
        })
    }

    async getProvider() {
        return this.oidc.callback
    }
}

module.exports = OidcProvider
