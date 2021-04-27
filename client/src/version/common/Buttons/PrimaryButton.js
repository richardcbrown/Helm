import React from "react"

import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import { getCurrentTheme } from "../../../core/config/styles"

const styles = (theme) => {
  theme = theme.palette.mainColor ? theme : getCurrentTheme()

  return {
    createButton: {
      display: "block",
      width: "auto",
      minWidth: "100px",
      paddingLeft: "5px",
      paddingRight: "5px",
      height: 40,
      margin: 8,
      padding: 0,
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
  }
}

/**
 * This component returns PrimaryButton
 *
 * @author Richard Brown
 * @param {shape}  classes
 * @param {func}   onClick
 * @param {string} label
 */
const PrimaryButton = ({ classes, onClick, label, hideIcon, disabled, icon }) => {
  const Icon = icon

  return (
    <Tooltip title={label}>
      <IconButton disabled={disabled} aria-label={label} className={classes.createButton} onClick={onClick}>
        {hideIcon ? null : <Icon />}
        {label}
      </IconButton>
    </Tooltip>
  )
}

export default withStyles(styles)(PrimaryButton)
