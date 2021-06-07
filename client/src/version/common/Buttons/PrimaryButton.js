import React from "react"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"

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
      <IconButton disabled={disabled} aria-label={label} className={"button--primary"} onClick={onClick}>
        {hideIcon ? null : <Icon />}
        {label}
      </IconButton>
    </Tooltip>
  )
}

export default PrimaryButton
