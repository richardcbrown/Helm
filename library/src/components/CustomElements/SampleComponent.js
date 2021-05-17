import React from "react"
import { Typography } from "@material-ui/core"
import { withCanvas, withResource, withSubmit } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase"
import Questionnaire from './Questionnaire/Questionnaire';

class SampleComponent extends ReactMaterialComponentBase {
    constructor() {
        super()

        console.log(this.resources)

        this.jsxRootComponent = () => <Questionnaire />

    }
}

customElements.define("helm-sample-component", withResource(withCanvas(SampleComponent), "Questionnaire"))
