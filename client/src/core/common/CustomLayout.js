import React, { Component, useEffect } from "react"
import get from "lodash/get"
import { connect } from "react-redux"
import Layout from "./Layout"

import { withStyles } from "@material-ui/core/styles"

import CustomSidebar from "./Sidebar"
import CustomTopBar from "./Topbar"
import CustomFooter from "./Footer"

import { getCurrentTheme } from "../config/styles"
import { getPreferencesAction } from "../../version/actions/preferencesActions"
import { Hidden } from "@material-ui/core"

const styles = {
  root: {
    flexDirection: "column",
    zIndex: 1,
    minHeight: "100vh",
    position: "relative",
    maxWidth: "100% !important",
    minWidth: "100% !important",
    "& > div": {
      minHeight: "100vh",
      overflowX: "hidden !important",
      margin: 0,
    },
    "& main > div": {
      padding: 0,
    },
  },
  sidebarOpen: {
    width: "calc(100% - 240px)",
    display: "flex",
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: "column",
  },
  sidebarClosed: {
    width: "100%",
    display: "flex",
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: "column",
  },
}

/**
 * This component returns custom layout
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @constructor
 */
const CustomLayout = ({ classes, preferences, getPreferences, children, isSidebarOpen, ...rest }) => {
  const { data, loading } = preferences

  if (!data && !loading) {
    getPreferences()
  }

  return (
    <Layout
      {...rest}
      className={classes.root}
      appBar={CustomTopBar}
      sidebar={CustomSidebar}
      notification={CustomFooter}
    >
      <Hidden mdUp>
        <div className={classes.sidebarClosed}>{children}</div>
      </Hidden>
      <Hidden smDown>
        <div className={isSidebarOpen ? classes.sidebarOpen : classes.sidebarClosed}>{children}</div>
      </Hidden>
    </Layout>
  )
}

const mapStateToProps = (state) => {
  const preferences = get(state, "custom.preferences", {})

  const userPrefs = (preferences && preferences.data && preferences.data.preferences) || {}

  const contrastMode = get(userPrefs, "general.preferences.contrastMode", false)

  return {
    theme: getCurrentTheme(contrastMode),
    preferences,
    isSidebarOpen: state.admin.ui.sidebarOpen,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getPreferences: () => dispatch(getPreferencesAction.request()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CustomLayout))
