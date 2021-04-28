import React, { Component } from "react"
import get from "lodash/get"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"

import DashboardCard from "../../common/DashboardCard"
import { synopsisData, getSynopsisProps } from "./config"
import Breadcrumbs from "../../common/Breadcrumbs"
import { themeCommonElements } from "../../../version/config/theme.config"
import { nonCoreSynopsisActions } from "../../../version/config/nonCoreSynopsis"
import { getSummaryContainerStyles } from "./functions"
import { PageTitle } from "../../common/PageTitle"

const styles = (theme) => ({
  summaryContainer: getSummaryContainerStyles(synopsisData),
  card: {
    borderRadius: 0,
  },
  media: {
    backgroundColor: theme.palette.mainColor,
  },
  container: {
    width: "100%",
    height: "100%",
    background: theme.patientSummaryPanel.container.background,
    backgroundSize: "cover",
  },
  topBlock: {
    display: "flex",
    flexDirection: "column",
    height: 100,
    backgroundColor: theme.palette.mainColor,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    color: theme.palette.common.white,
    "&:hover": {
      cursor: "pointer",
    },
  },
  topBlockListOnly: {
    display: "flex",
    flexDirection: "column",
    height: 100,
    backgroundColor: theme.palette.mainColor,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    color: theme.palette.common.white,
  },
  icon: {
    marginBottom: 10,
    zIndex: 2,
  },
  mainHeading: {
    margin: 0,
    zIndex: 2,
  },
  title: {
    marginBottom: 0,
    fontSize: 20,
    fontWeight: 800,
    zIndex: 2,
  },
  list: {
    padding: 0,
    zIndex: 2,
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 15,
    zIndex: 2,
    fontSize: "1rem",
    borderLeft: `1px solid ${theme.palette.borderColor}`,
    borderRight: `1px solid ${theme.palette.borderColor}`,
    borderBottom: `1px solid ${theme.palette.borderColor}`,
  },
  emptyRows: {
    height: 150,
    zIndex: 2,
    borderLeft: `1px solid ${theme.palette.borderColor}`,
    borderRight: `1px solid ${theme.palette.borderColor}`,
    borderBottom: `1px solid ${theme.palette.borderColor}`,
  },
})

class PatientSummaryInfo extends Component {
  componentDidMount() {
    window.analytics.page({ url: window.location.hash })

    if (localStorage.getItem("userId") && localStorage.getItem("username")) {
      this.props.getPatientSynopsis()
    }
  }

  render() {
    const { classes, loading, showMode, displayMode, location } = this.props
    const breadcrumbsResource = [{ url: location.pathname, title: "Patient Summary", isActive: false }]
    const FeedsPanels = get(themeCommonElements, "feedsPanels", false)
    return (
      <Grid className={classes.container}>
        <PageTitle />
        <Breadcrumbs resource={breadcrumbsResource} />
        <Grid className={classes.summaryContainer} spacing={4} container>
          {synopsisData.map((item, key) => {
            return (
              <DashboardCard
                key={key}
                showMode={displayMode}
                id={item.id}
                title={item.title}
                list={item.list}
                loading={loading}
                items={get(this.props, item.list, [])}
                icon={item.icon}
                listOnly={item.listOnly}
                {...this.props}
              />
            )
          })}
          {FeedsPanels && <FeedsPanels />}
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = (state) => {
  const preferences = get(state, "custom.preferences", {})

  const userPrefs = (preferences && preferences.data && preferences.data.preferences) || {}

  const displayMode = get(userPrefs, "general.preferences.patientSummary", "headingsandlist")

  const patientSummaryProps = {
    loading: state.custom.demographics.loading,
  }

  const synopsisProps = getSynopsisProps(state)

  return Object.assign({ displayMode }, patientSummaryProps, synopsisProps)
}

const mapDispatchToProps = (dispatch) => {
  const coreSynopsisActions = []

  const synopsisActions = coreSynopsisActions.concat(nonCoreSynopsisActions)

  return {
    getPatientSynopsis() {
      synopsisActions.map((item) => {
        return dispatch(item.request())
      })
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PatientSummaryInfo))
