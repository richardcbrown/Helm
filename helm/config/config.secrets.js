const { SecretManagerServiceClient } = require("@google-cloud/secret-manager")
const { MoleculerError } = require("moleculer").Errors

const secretManager = new SecretManagerServiceClient()

const fs = require("fs")
const path = require("path")

class SecretManager {
    constructor(project) {
        this.project = project
    }

    async getSecret(secretId, isFileSecret = false) {
        try {
            const envSecret = process.env[secretId]

            if (!this.isGcpSecret(envSecret)) {
                if (isFileSecret && envSecret) {
                    return fs.readFileSync(path.join(__dirname, "../", envSecret))
                } else {
                    return envSecret
                }
            }

            const { project } = this

            if (!project) {
                throw new MoleculerError("Project has not been defined", 500)
            }

            const [secret] = await secretManager.accessSecretVersion({
                name: `projects/${project}/secrets/${process.env[secretId]}/versions/latest`,
            })

            if (!secret || !secret.payload || !secret.payload.data) {
                throw new MoleculerError(`Secret ${secretId} not found`, 500)
            }

            const gcpSecret = secret.payload.data.toString("utf8")

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
