/**
 * @typedef {Object} FhirStoreConfig
 * @property {string} host
 */

/**
 * @typedef {Object} LcrConsentAuthConfig
 * @property {string} host
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} grantType
 */

/**
 * @typedef {Object} LcrConsentConfig
 * @property {string} host
 */

/**
 * @typedef {Object} FhirAuthConfig
 * @property {string} host
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} grantType
 * @property {string} scope
 * @property {string} ods
 * @property {string} rsn
 * @property {string} rol
 * @property {string} aud
 * @property {string} sub
 * @property {string} iss
 * @property {string} azp
 */

/**
 * @typedef {Object} OidcUrlConfiguration
 * @property {string} issuer
 * @property {string} authorizationEndpoint
 * @property {string} tokenEndpoint
 * @property {string} userInfoEndpoint
 * @property {string} introspectionEndpoint
 * @property {string} jwksEndpoint
 * @property {string} endSessionEndpoint
 */

/**
 * @typedef {Object} OidcScopeConfiguration
 * @property {string} login
 */

/**
 * @typedef {Object} OidcHttpOptions
 * @property {boolean} rejectUnauthorized
 * @property {number} timeout
 */

/**
 * @typedef {Object} OidcClientConfiguration
 * @property {string} oidcProviderHost
 * @property {OidcUrlConfiguration} urls
 * @property {string} typedef
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {OidcScopeConfiguration} scope
 * @property {OidcHttpOptions} defaultHttpOptions
 * @property {string} tokenEndpointAuthMethod
 * @property {string} tokenEndpointAuthSigningAlg
 * @property {string} privateKeyFilePath
 * @property {string} redirectUrl
 */

/**
 * @typedef {Object} OidcProviderConfiguration
 * @property {string} issuer
 * @property {string} privateKeyFilePath
 * @property {string} verifyUrl
 * @property {string} verifyClientId
 * @property {string} verifyClientSecret
 * @property {Array<string>} introspectionAllowedClients
 */

/**
 * @typedef {Object} DatabaseConfiguration
 * @property {string} host
 * @property {string} username
 * @property {string} password
 * @property {number} port
 * @property {string} database
 * @property {string} schema
 */

/**
 * @typedef {Object} SiteAuthConfiguration
 * @property {string} jwtSigningSecret
 * @property {number} jwtExpiry
 * @property {string} issuer
 * @property {string} audience
 * @property {"HS256" | "HS384" | "HS512" | "RS256" | undefined} jwtSigningAlgorithm
 */

/**
 * @typedef {Object} ConsentConfiguration
 * @property {Array<string>} policyNames
 * @property {Array<string>} policyFriendlyNames
 */

/**
 * @typedef {Object} RedisConfiguration
 * @property {number} port
 */

module.exports = {}
