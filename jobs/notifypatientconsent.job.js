class NotifyPatientConsentJob {
    constructor(databaseClient, consentGenerator) {
        this.databaseClient = databaseClient
        this.consentGenerator = consentGenerator
        this.process = this.process.bind(this)
    }

    async process() {
        const dbClient = await this.databaseClient.connect()

        try {
            await dbClient.query("BEGIN")

            const processing = await dbClient.query(
                'SELECT "Identifier", "Resource", "FullUrl" FROM helm."PendingPatientConsent" FOR UPDATE SKIP LOCKED LIMIT 10'
            )

            const results = await this.processPatientConsent(processing.rows)

            const processedRows = results.filter((res) => res.success).map((res) => res.identifier)

            for (const identifier of processedRows) {
                await dbClient.query('DELETE FROM helm."PendingPatientConsent" WHERE "Identifier" = $1', [identifier])
            }

            await dbClient.query("COMMIT")
        } catch (error) {
            await dbClient.query("ROLLBACK")
        } finally {
            await dbClient.release()
        }
    }

    /**
     *
     * @param {Array<{ Resource: fhir.Patient, FullUrl: string, Identifier: string }>} patients
     */
    async processPatientConsent(patients) {
        const results = []

        for (const item of patients) {
            const { Resource, FullUrl, Identifier } = item

            try {
                await this.consentGenerator.generatePatientConsent(Identifier, Resource, FullUrl)

                results.push({ identifier: Identifier, success: true })
            } catch (error) {
                results.push({ identifier: Identifier, success: false })
            }
        }

        return results
    }
}

module.exports = { NotifyPatientConsentJob }
