import React, { useRef } from "react"
import { Grid, Card, makeStyles, Hidden, SvgIcon } from "@material-ui/core"
import TableHeader from "../../../core/common/TableHeader"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import backgroundImage from "../../images/Artboard.png"
import Accordion from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import Typography from "@material-ui/core/Typography"
import { useEffect } from "react"
import { PageTitle } from "../../../core/common/PageTitle"

export default function AboutMe(props) {
    const canvasRef = useRef(null)

    useEffect(() => {
        window.analytics.page({ url: window.location.hash })
        const token = localStorage.getItem("token");

        const headers = { Authorization: `Bearer ${token}`, "X-Requested-With": "XMLHttpRequest" }

        canvasRef.current.setAuthHandler((request, options) => {
            request.headers = headers
            return request
        })
    }, [])

    const resourceUrl = "about-me"
    const title = "About You"

    const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

    return (
        <React.Fragment>
            <PageTitle />
            <Breadcrumbs resource={breadcrumbsResource} />
            <TableHeader resource={resourceUrl} />

            <syn-canvas ref={canvasRef} library-root="http://localhost:8882/registry">
                <syn-panel
                    panel-id="test-panel"
                    panel="sample-panel"
                    submit="http://helm-local.com/api/patient/fhir"
                    questionnaire-src="http://helm-local.com/api/patient/fhir/Questionnaire?identifier=https://fhir.myhelm.org/questionnaire-identifier|aboutMe"></syn-panel>
            </syn-canvas>

        </React.Fragment>
    )
}
