import React from "react"
import { SaveButton } from "react-admin"
import DoneIcon from "@material-ui/icons/Done"

/**
 * This component returns Confirm button
 *
 * @author Richard Brown
 * @param {shape}  classes
 * @param {func}   onClick
 * @param {string} label
 */
const CustomSaveButton = ({ classes, label, redirectTo, rest }) => (
  <SaveButton
    redirect={redirectTo}
    aria-label={label}
    label={label}
    icon={<DoneIcon />}
    className={"button--primary"}
    {...rest}
  />
)

export default CustomSaveButton
