import React from "react"
import { ThemeProvider, Typography } from "@material-ui/core";
import { getCurrentTheme } from './Styles';
import { Provider } from 'react-redux';
import { store } from '../app/observationStore';
import { withCanvas, withResource, withSubmit, withResourceRoot, withConfiguration } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase";
import Observation from '../React/Observation/Observation';

class ObservationComponent extends ReactMaterialComponentBase {
    constructor() {
        super()
        this.jsxRootComponent = () => {
            console.log(this.resources)
            console.log((this.configuration))
            const configuration = this.configuration || null
            const observations = this.resources["Observation"] || []

            return <Provider store={store} ><ThemeProvider theme={getCurrentTheme()}><Observation
                configuration={configuration}
                observations={observations}
                getObservations={(codes) => this.refreshResources(codes)}
                saveObservations={(observations) => this.saveResources(observations)} /></ThemeProvider></Provider >
        }

    }

    /**
     * @param {fhir.Coding[]} codes
     * @returns {Promise<void>}
     */
    refreshResources(codes) {
        const codeString = codes.map((code) => (code.system ? `${code.system}|${code.code}` : code)).join(",")

        return this.requestResources("Observation", `code=${codeString}`, {})
    }

    /**
     * @param {fhir.Observation[]} observations
     * @returns {Promise<void>}
     */
    saveResources(observations) {
        const changeRequests = observations.map((observation) => ({
            changeOperation: "POST",
            changedResource: observation,
        }))

        return this.submit(changeRequests)
    }

    configurationChangedCallback() {
        this.render()
    }
}

customElements.define("helm-observation-component", withConfiguration(withResourceRoot(withSubmit(withCanvas(ObservationComponent)), "ObservationResponse")))
