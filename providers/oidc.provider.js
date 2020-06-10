const { Provider } = require("oidc-provider")

const {
    JWKS: { KeyStore },
    JWK,
} = require("jose")

const fs = require("fs")
const path = require("path")

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
    }

    getProvider() {
        const { configuration, adapter } = this

        const key = fs.readFileSync(configuration.privateKeyFilePath)
        this.keystore.add(JWK.asKey(key))

        const oidc = new Provider(configuration.issuer, {
            adapter: adapter,
            features: {
                registration: {
                    enabled: false,
                },
                clientCredentials: {
                    enabled: true,
                },
                introspection: {
                    enabled: true,
                    allowedPolicy: async (ctx, client, token) => {
                        console.log("introspect")

                        if (
                            client.introspectionEndpointAuthMethod === "none" &&
                            token.clientId !== ctx.oidc.client.clientId
                        ) {
                            return false
                        }
                        return true
                    },
                },
                devInteractions: {
                    enabled: false,
                },
            },
            jwks: this.keystore.toJWKS(true),
        })

        return oidc.callback
    }
}

module.exports = OidcProvider
