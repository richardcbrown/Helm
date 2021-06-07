import React, { Component } from "react"
import { withRouter } from "react-router"
import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import { SvgIcon } from "@material-ui/core"
import { ReactComponent as AccessibilityIcon } from "../../../images/Icons/Accesibility.svg"

const styles = (theme) => ({
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
})

/**
 * This component returns Accessibility button
 *
 */
class AccessibilityButton extends Component {
  constructor(props) {
    super(props)
    this.button = React.createRef()
  }

  render() {
    const { classes, history } = this.props
    return (
      <div className={classes.rightBlockItem} ref={this.button}>
        <Tooltip title="Accessibility statement">
          <IconButton
            id="icon-accessibility"
            className={classes.rightBlockButton}
            aria-owns={"menu-appbar"}
            aria-haspopup="true"
            onClick={() => history.push("/accessibility")}
            color="inherit"
            aria-label="Accessibility statement"
          >
            <SvgIcon viewBox="0 0 30 30" fontSize="small">
              <AccessibilityIcon />
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}

export default withStyles(styles)(withRouter(AccessibilityButton))
