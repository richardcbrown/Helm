import React from "react"

import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import AddIcon from "@material-ui/icons/Add"
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
 * This component returns Confirm button
 *
 * @author Richard Brown
 * @param {shape}  classes
 * @param {func}   onClick
 * @param {string} label
 */
const ConfirmButton = ({ classes, onClick, label, hideIcon, disabled }) => (
  <Tooltip title={label}>
    <IconButton disabled={disabled} aria-label={label} className={classes.createButton} onClick={onClick}>
      {hideIcon && <AddIcon />}
      {label}
    </IconButton>
  </Tooltip>
)

export default withStyles(styles)(ConfirmButton)
