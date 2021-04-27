import React from "react"

import AppBar from "@material-ui/core/AppBar"
import { withStyles } from "@material-ui/core/styles"
import TopPart from "../Topbar/fragments/TopPart"

const styles = {
  appBar: {
    boxShadow: "none",
  },
  whitePart: {
    backgroundColor: "white",
  },
  backButton: {
    color: "#0D672F",
  },
  userMenuButton: {
    color: "#0D672F",
  },
}

/**
 * This is common component for theme TopBar
 *
 */
const TopBarOnly = ({ classes, ...rest }) => {
  return (
    <AppBar position="static" className={classes.appBar}>
      <TopPart noUserJourney={true} {...rest} />
    </AppBar>
  )
}

export default withStyles(styles)(TopBarOnly)
