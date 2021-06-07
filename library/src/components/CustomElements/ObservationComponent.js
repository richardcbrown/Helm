import React from "react"
import { Provider } from "react-redux"
import { store } from "../app/observationStore"
import { withCanvas, withResource, withSubmit, withResourceRoot, withConfiguration } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase"
import Observation from "../React/Observation/Observation"

class ObservationComponent extends ReactMaterialComponentBase {
    constructor() {
        super()
        this.jsxRootComponent = () => {
            const configuration = this.configuration || null
            const observations = this.resources["Observation"] || []

            return (
                <Provider store={store}>
                    <Observation
                        configuration={configuration}
                        observations={observations}
                        getObservations={(codes) => this.refreshResources(codes)}
                        saveObservations={(observations) => this.saveResources(observations)}
                    />
                </Provider>
            )
        }
    }

    /**
     * @param {fhir.Coding[]} codes
     * @returns {Promise<void>}
     */
    refreshResources(codes) {
        // const codeString = codes.map((code) => (code.system ? `${code.system}|${code.code}` : code)).join(",")

        return this.requestResources("Observation", "", {})
    }

    /**
     * @param {fhir.Observation[]} observations
     * @returns {Promise<void>}
     */
    saveResources(observations) {
        // const changeRequests = observations.map((observation) => ({
        //     changeOperation: "POST",
        //     changedResource: observation,
        // }))
        const changeRequest = {
            changeOperation: "POST",
            changedResource: observations,
        }

        return this.submit([changeRequest])
    }

    configurationChangedCallback() {
        this.render()
    }
}

customElements.define(
    "helm-observation-component",
    withConfiguration(withResourceRoot(withSubmit(withCanvas(ObservationComponent)), "ObservationResponse"))
)
