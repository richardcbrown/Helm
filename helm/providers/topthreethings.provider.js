/** @typedef {import("moleculer").Context<any, any>} Context */

const { getPatientByNhsNumber } = require("../requestutilities/fhirrequest.utilities")
const { makeReference } = require("../models/resource.helpers")
const { getFromBundle } = require("../models/bundle.helpers")

class TopThreeThingsProvider {
    /**
     * @param {Context} ctx
     */
    constructor(ctx) {
        /**
         * @private
         */
        this.ctx = ctx
    }

    async getTopThreeThings(nhsNumber) {
        const patient = await getPatientByNhsNumber(nhsNumber, this.ctx)

        const latestTopThreeThingsBundle = await this.ctx.call("internalfhirservice.search", {
            resourceType: "Composition",
            type: "https://fhir.myhelm.org/STU3/ValueSet/phr-composition-type-1|T3T",
            subject: makeReference(patient),
            _sort: "-date",
            _count: 1,
        })

        const [latestTopThreeThings] = getFromBundle(latestTopThreeThingsBundle, "Composition")

        return latestTopThreeThings || null
    }
}

module.exports = { TopThreeThingsProvider }
