const { SecretManagerServiceClient } = require("@google-cloud/secret-manager")
const secretManager = new SecretManagerServiceClient()

const fs = require("fs")
const path = require("path")

class SecretManager {
    constructor(project) {
        this.project = project
        this.cache = {}
    }

    async getSecret(secretId, isFileSecret = false) {
        try {
            if (this.cache[secretId]) {
                return this.cache[secretId]
            }

            const envSecret = process.env[secretId]

            if (!this.isGcpSecret(envSecret)) {
                if (isFileSecret && envSecret) {
                    this.cache[secretId] = fs.readFileSync(path.join(__dirname, "../", envSecret))
                } else {
                    this.cache[secretId] = envSecret
                }

                return this.cache[secretId]
            }

            const { project } = this

            if (!project) {
                throw Error("Project has not been defined")
            }

            const [secret] = await secretManager.accessSecretVersion({
                name: `projects/${project}/secrets/${process.env[secretId]}/versions/latest`,
            })

            if (!secret || !secret.payload || !secret.payload.data) {
                throw Error(`Secret ${secretId} not found`)
            }

            const gcpSecret = secret.payload.data.toString("utf8")

            this.cache[secretId] = gcpSecret

            return gcpSecret
        } catch (err) {
            if (err.code === 5) return undefined // Secret doesn't exist
            if (err.code === 9) return undefined // Secret is disabled

            throw err
        }
    }

    /**
     * @private
     * @param {string | undefined} secretId
     */
    isGcpSecret(secretId) {
        return secretId && secretId.startsWith("gcp_")
    }
}

module.exports = SecretManager
