import React from "react"
import { Typography } from "@material-ui/core"
import { Provider } from 'react-redux';
import { store } from '../app/store';
import { withCanvas, withResource, withSubmit } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase"
import Questionnaire from './Questionnaire/Questionnaire';

class SampleComponent extends ReactMaterialComponentBase {
    constructor() {
        super()

        // console.log(this.resources)

        this.jsxRootComponent = () => <Provider store={store} ><Questionnaire /></Provider>

    }
}

customElements.define("helm-sample-component", withCanvas(SampleComponent))
