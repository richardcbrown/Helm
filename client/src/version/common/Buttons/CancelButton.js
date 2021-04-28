import React from "react"

import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import BlockIcon from "@material-ui/icons/Block"
import Tooltip from "@material-ui/core/Tooltip"

const styles = (theme) => ({
  button: {
    display: "block",
    width: 100,
    height: 40,
    margin: "8px !important",
    padding: 0,
    color: "#fff",
    backgroundColor: theme.palette.dangerColor,
    border: `1px solid ${theme.palette.dangerColor}`,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 800,
    "&:hover": {
      color: theme.palette.dangerColor,
      backgroundColor: "#fff",
    },
  },
})

/**
 * This component returns Cancel button
 *
 * @author Richard Brown
 * @param {shape} classes
 * @param {func}  onClick
 */
const CancelButton = ({ classes, onClick, label }) => (
  <Tooltip title={label}>
    <IconButton aria-label={label} className={classes.button} onClick={onClick}>
      <BlockIcon /> {label}
    </IconButton>
  </Tooltip>
)

export default withStyles(styles)(CancelButton)
