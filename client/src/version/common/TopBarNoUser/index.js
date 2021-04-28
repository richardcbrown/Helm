import React from "react"

import AppBar from "@material-ui/core/AppBar"
import { withStyles } from "@material-ui/core/styles"

import TopBar from "./fragments/TopBar"

const styles = {
  appBar: {
    boxShadow: "none",
  },
}

/**
 * This is common component for theme TopBar
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
const TopBarNoUser = ({ classes, ...rest }) => {
  return (
    <AppBar position="static" className={classes.appBar}>
      <TopBar {...rest} />
    </AppBar>
  )
}

export default withStyles(styles)(TopBarNoUser)
