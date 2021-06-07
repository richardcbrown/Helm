import React from "react"
import { Provider } from "react-redux"
import { store } from "../app/questionnaireStore"
import { withCanvas, withResource, withSubmit, withResourceRoot } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase"
import Questionnaire from "../React/Questionnaire/Questionnaire"

class QuestionnaireComponent extends ReactMaterialComponentBase {
    constructor() {
        super()

        this.jsxRootComponent = () => {
            console.log(this.resources)
            const questionnaireList = this.resources.Questionnaire
            const top3ThingsQuestionnaire = this.resources.top3ThingsQuestionnaire
            console.log(top3ThingsQuestionnaire)
            return (
                <Provider store={store}>
                    <Questionnaire
                        resources={this.resources}
                        submit={(changedResource) => this.submit([changedResource])}
                        requestResources={(questionResponse, queryParams, bodyParams) =>
                            this.requestResources(questionResponse, queryParams, bodyParams)
                        }
                    />
                </Provider>
            )
        }
    }

    getTop3Things() {}
}

customElements.define(
    "helm-questionnaire-component",
    withResourceRoot(
        withSubmit(
            withResource(withResource(withCanvas(QuestionnaireComponent), "Questionnaire"), "top3ThingsQuestionnaire")
        ),
        "QuestionnaireResponse"
    )
)
