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



        this.jsxRootComponent = () => {
            console.log(this.resources.Questionnaire)
            const questionnaireList = this.resources.Questionnaire
            return <Provider store={store} ><Questionnaire questionnaireList={this.resources.Questionnaire} /></Provider >
        }

    }
}

customElements.define("helm-sample-component", withResource(withCanvas(SampleComponent), "Questionnaire"))
