const { getPatientEntryByNhsNumber } = require("../requestutilities/fhirrequest.utilities")

class PendingConsentGenerator {
    constructor(ctx, databaseClient) {
        this.ctx = ctx
        this.databaseClient = databaseClient
    }

    async generatePendingConsent(nhsNumber) {
        const dbClient = await this.databaseClient.connect()

        try {
            const patientEntry = await getPatientEntryByNhsNumber(nhsNumber, this.ctx)

            const { fullUrl, resource } = patientEntry

            await dbClient.query(
                'INSERT INTO helm."PendingPatientConsent" ("Identifier", "Resource", "FullUrl") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [nhsNumber, resource, fullUrl]
            )
        } catch (error) {
            /** @todo logging */
        } finally {
            dbClient.release()
        }
    }
}

module.exports = { PendingConsentGenerator }
