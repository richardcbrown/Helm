import React from "react"
import { Typography } from "@material-ui/core"
import { withCanvas } from "synrb-panel-library"
import { ReactMaterialComponentBase } from "./ReactMaterialComponentBase"

class SampleComponent extends ReactMaterialComponentBase {
    constructor() {
        super()

        this.jsxRootComponent = () => <Typography>Hello World</Typography>
    }
}

customElements.define("helm-sample-component", withCanvas(SampleComponent))
