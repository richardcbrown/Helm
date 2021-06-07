import React from "react"

import IconButton from "@material-ui/core/IconButton"
import AddIcon from "@material-ui/icons/Add"
import Tooltip from "@material-ui/core/Tooltip"

/**
 * This component returns Confirm button
 *
 * @author Richard Brown
 * @param {shape}  classes
 * @param {func}   onClick
 * @param {string} label
 */
const ConfirmButton = ({ onClick, label, hideIcon, disabled }) => (
  <Tooltip title={label}>
    <IconButton disabled={disabled} aria-label={label} className={"button--primary"} onClick={onClick}>
      {hideIcon && <AddIcon />}
      {label}
    </IconButton>
  </Tooltip>
)

export default ConfirmButton
