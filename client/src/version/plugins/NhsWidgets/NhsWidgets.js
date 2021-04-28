import React from "react"
import { Grid, Card, makeStyles, Hidden, SvgIcon } from "@material-ui/core"
import NhsWidgetDisplay from "./NhsWidgetDisplay"
import TableHeader from "../../../core/common/TableHeader"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import backgroundImage from "../../images/Artboard.png"
import Accordion from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import Typography from "@material-ui/core/Typography"
import { useEffect } from "react"
import { ReactComponent as ChevronUp } from "../../images/Icons/Chevron-down.svg"
import { PageTitle } from "../../../core/common/PageTitle"

const usePrimaryAccordionStyles = makeStyles((theme) => {
  return {
    mainHeader: {
      backgroundColor: theme.palette.mainColor,
      color: theme.palette.common.white,
    },
    icon: {
      color: theme.palette.common.white,
    },
    container: {
      border: `1px solid ${"#D8DDE0"}`,
      borderRadius: 0,
    },
  }
})

const nhsWidgets = [
  {
    title: "NHS Live Well",
    widgetTitle: "NHS Live Well Widget",
    url: "https://api-bridge.azurewebsites.net/conditions/?uid=aW5mb0BteWhlbG0ub3Jn",
  },
  {
    title: "A-Z",
    widgetTitle: "NHS A-Z Widget",
    url: "https://api-bridge.azurewebsites.net/livewell/?uid=aW5mb0BteWhlbG0ub3Jn",
  },
  {
    title: "Social Care Support",
    widgetTitle: "NHS Social Care Support Widget",
    url: "https://api-bridge.azurewebsites.net/conditions/?uid=aW5mb0BteWhlbG0ub3Jn&p=social-care-and-support-guide",
  },
]

const useStyles = makeStyles({
  createBlock: {
    background: `url(${backgroundImage})`,
    backgroundSize: "cover",
    margin: 0,
    width: "100%",
    height: "100%",
    alignContent: "flex-start",
  },
})

const NhsWidgets = (props) => {
  const classes = useStyles()

  useEffect(() => {
    window.analytics.page({ url: window.location.hash })
  }, [])

  const resourceUrl = "nhs-resources"
  const title = "NHS Resources"

  const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

  const accordionStyle = usePrimaryAccordionStyles()

  return (
    <React.Fragment>
      <PageTitle />
      <Breadcrumbs resource={breadcrumbsResource} />
      <TableHeader resource={resourceUrl} />
      <Grid container spacing={4} className={classes.createBlock}>
        {nhsWidgets.map((widget, index) => {
          return (
            <>
              <Hidden smDown>
                <Grid item xs={12} sm={6} lg={4}>
                  <Card>
                    <NhsWidgetDisplay height={500} src={widget.url} id={index} />
                  </Card>
                </Grid>
              </Hidden>
              <Hidden mdUp>
                <Grid item xs={12} style={{ alignSelf: "flex-start" }}>
                  <Accordion className={accordionStyle.container}>
                    <AccordionSummary
                      expandIcon={
                        <SvgIcon viewBox="0 0 18 11" fontSize="small" className={accordionStyle.icon}>
                          <ChevronUp />
                        </SvgIcon>
                      }
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      className={accordionStyle.mainHeader}
                    >
                      <Typography variant="h5">{widget.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ padding: 0 }}>
                      <NhsWidgetDisplay title={widget.widgetTitle} height={500} src={widget.url} id={index} />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Hidden>
            </>
          )
        })}
      </Grid>
    </React.Fragment>
  )
}

export default NhsWidgets
