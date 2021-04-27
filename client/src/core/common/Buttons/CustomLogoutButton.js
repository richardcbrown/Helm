import React from "react"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import ExitIcon from "@material-ui/icons/ExitToApp"
import Tooltip from "@material-ui/core/Tooltip"
import { logout } from "../../dataProviders/authProvider"

const styles = (theme) => ({
  button: {
    padding: 6,
    display: "block",
    width: 140,
    height: 40,
    margin: "8px !important",
    backgroundColor: "white",
    color: theme.palette.mainColor,
    border: `1px solid ${theme.palette.mainColor}`,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 800,
    "&:hover": {
      backgroundColor: theme.palette.mainColor,
      color: "white",
    },
  },
  icon: {
    marginLeft: 10,
  },
})

/**
 * This component returns custom Logout button
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape}   classes
 * @param {string}  title
 * @param {boolean} hideIcon
 */
const CustomLogoutButton = ({ classes, title = "Sign Out", hideIcon }) => {
  return (
    <Tooltip title={title}>
      <IconButton
        className={classes.button}
        onClick={() => {
          localStorage.setItem("logout", "true")
          logout()
        }}
        aria-label="Sign Out"
      >
        {title}
        {!hideIcon && <ExitIcon className={classes.icon} />}
      </IconButton>
    </Tooltip>
  )
}

export default withStyles(styles)(CustomLogoutButton)
