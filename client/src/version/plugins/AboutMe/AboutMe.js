import React from "react"
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

    useEffect(() => {
        window.analytics.page({ url: window.location.hash })
    }, [])

    const resourceUrl = "about-me"
    const title = "About You"

    const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

    return (
        <React.Fragment>
            <PageTitle />
            <Breadcrumbs resource={breadcrumbsResource} />
            <TableHeader resource={resourceUrl} />

            <syn-canvas library-root="http://localhost:8882/registry">
                <syn-panel panel-id="test-panel" panel="sample-panel"></syn-panel>
            </syn-canvas>

        </React.Fragment>
    )
}
