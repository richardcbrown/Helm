import React, { Component } from "react"

import { makeStyles } from "@material-ui/core/styles"
import CardMedia from "@material-ui/core/CardMedia"
import Toolbar from "@material-ui/core/Toolbar"

import helmLogo from "../../../images/helm-logo.png"
import nhsLogo from "../../../images/nhs.png"

const useStyles = makeStyles((theme) => ({
  topPart: {
    display: "flex",
    backgroundColor: "white",
    justifyContent: "space-around",
    border: `1px solid ${theme.palette.borderColor}`,
    minHeight: 54,
    padding: 0,
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
  emptyBlock: {
    flexGrow: 1,
  },
}))

/**
 * This component returns Top part of Helm Topbar
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
const TopPart = () => {
  const classes = useStyles()

  return (
    <Toolbar className={classes.topPart}>
      <div className={classes.mainLogoItem}>
        <CardMedia
          id="logo-image"
          className={classes.image}
          component="img"
          alt="Helm Logo"
          height="38px"
          image={helmLogo}
          title="Helm Logo"
        />
      </div>
      <div className={classes.emptyBlock}></div>
      <CardMedia
        className={classes.nhsLogo}
        component="img"
        alt="NHS Logo"
        height="29px"
        image={nhsLogo}
        title="NHS Logo"
      />
    </Toolbar>
  )
}

export default TopPart
