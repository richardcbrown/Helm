import React from "react"
import { SaveButton } from "react-admin"
import DoneIcon from "@material-ui/icons/Done"
import { withStyles } from "@material-ui/core/styles"

const styles = (theme) => ({
  saveButton: {
    display: "block",
    height: 40,
    margin: 8,
    padding: "0 6px",
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
})

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
    className={classes.saveButton}
    {...rest}
  />
)

export default withStyles(styles)(CustomSaveButton)
