/** @typedef {import("request-promise-native").Options} Options */

const request = require("request-promise-native")

function mapPatientResource(patientId, resource, config) {
    if (config && process.env.node_env === "development") {
        const { nhsNumberMapping } = config

        if (nhsNumberMapping && nhsNumberMapping[`${patientId}`]) {
            const patientDetails = nhsNumberMapping[`${patientId}`]

            return {
                ...resource,
                ...patientDetails,
            }
        }
    }

    return resource
}

class LcrPatientConsentGenerator {
    constructor(configuration, authProvider) {
        this.configuration = configuration
        this.authProvider = authProvider
    }

    /**
     *
     * @param {fhir.Patient} patient
     */
    async generatePatientConsent(patientIdentifier, patient, fullUrl) {
        try {
            const { resourceType, id, identifier, birthDate } = mapPatientResource(patientIdentifier, patient)

            const options = {
                url: this.configuration.host,
                method: this.configuration.method,
                body: {
                    fullUrl,
                    resource: {
                        resourceType,
                        id,
                        identifier,
                        birthDate,
                        extension: [
                            {
                                url: "https://fhir.leedsth.nhs.uk/ValueSet/phr-consent-1",
                                valueBoolean: true,
                            },
                        ],
                    },
                },
                json: true,
            }

            await this.authProvider.authorize(options)

            await request(options)
        } catch (error) {
            /** @todo logging */
        }
    }
}

module.exports = LcrPatientConsentGenerator
