import React from "react"
import { Typography } from "@material-ui/core"
import { withCanvas } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase"
import Questionnaire from './Questionnaire/Questionnaire';

class SampleComponent extends ReactMaterialComponentBase {
    constructor() {
        super()

        this.jsxRootComponent = () => <Questionnaire />

    }
}

customElements.define("helm-sample-component", withCanvas(SampleComponent))
