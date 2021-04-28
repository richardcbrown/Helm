import React, { Component } from "react"
import { Link } from "react-router-dom"

import { withStyles } from "@material-ui/core/styles"
import CardMedia from "@material-ui/core/CardMedia"
import HomeIcon from "@material-ui/icons/Home"
import Toolbar from "@material-ui/core/Toolbar"

import helmLogo from "../../../images/helm-logo.png"
import nhsLogo from "../../../images/nhs.png"
import UserTour from "../../../features/UserTour"
import ContrastMode from "../../../features/ContrastMode"
import UserPanelButton from "./UserPanelButton"
import AccessibilityButton from "./AccessibilityButton"

const styles = (theme) => ({
  topPart: {
    display: "flex",
    backgroundColor: "white",
    justifyContent: "space-around",
    border: `1px solid ${theme.palette.borderColor}`,
    minHeight: 54,
    padding: 0,
  },
  homeButtonItem: {
    display: "inline-flex",
    position: "relative",
    minHeight: 54,
    minWidth: 54,
    backgroundColor: theme.palette.mainColor,
    justifyContent: "center",
    alignItems: "center",
  },
  homeButton: {
    color: "white",
  },
  mainLogoItem: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 9,
  },
  nhsLogo: {
    [theme.breakpoints.only("xs")]: {
      display: "none",
    },
    width: "auto",
    maxWidth: "100%",
    marginRight: 24,
  },
  rightBlockItem: {
    display: "inline-flex",
    position: "relative",
    minHeight: 54,
    minWidth: 54,
    justifyContent: "center",
    alignItems: "center",
    borderLeft: `1px solid ${theme.palette.borderColor}`,
    "&:hover": {
      backgroundColor: theme.palette.mainColor,
    },
    "&:active": {
      backgroundColor: theme.palette.mainColor,
    },
    "&:hover button": {
      color: "white",
    },
    "&:active button": {
      color: "white",
    },
    "&:hover a": {
      color: "white",
    },
    "&:active a": {
      color: "white",
    },
  },
  rightBlockButton: {
    color: theme.palette.mainColor,
    "&:hover": {
      color: "white",
    },
  },
  emptyBlock: {
    flexGrow: 1,
  },
})

/**
 * This component returns Top part of Helm Topbar
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
const TopPart = ({ classes, logout, location, history, noUserJourney }) => {
  return (
    <Toolbar className={classes.topPart}>
      <div className={classes.homeButtonItem}>
        <Link id="icon-home" to="/" className={classes.homeButton} aria-label="Home">
          <HomeIcon />
        </Link>
      </div>
      <div className={classes.mainLogoItem}>
        <Link to="/" className={classes.homeButton} aria-label="Home">
          <CardMedia
            id="logo-image"
            className={classes.image}
            component="img"
            alt="Helm Logo"
            height="38"
            image={helmLogo}
            title="Helm Logo"
          />
        </Link>
      </div>
      <div className={classes.emptyBlock}></div>
      <CardMedia
        className={classes.nhsLogo}
        component="img"
        alt="NHS Logo"
        height="29"
        image={nhsLogo}
        title="NHS Logo"
      />
      {noUserJourney ? null : <UserTour classes={classes} location={location} />}
      <ContrastMode classes={classes} />
      <UserPanelButton classes={classes} history={history} />
      <AccessibilityButton classes={classes} history={history} />
    </Toolbar>
  )
}

export default withStyles(styles)(TopPart)
