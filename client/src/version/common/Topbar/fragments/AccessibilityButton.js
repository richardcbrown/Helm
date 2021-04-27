import React, { Component } from "react"
import { withRouter } from "react-router"
import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import { SvgIcon } from "@material-ui/core"
import { ReactComponent as AccessibilityIcon } from "../../../images/Icons/Accesibility.svg"

const styles = {
  userPanel: {
    minWidth: 220,
    padding: 12,
  },
  userName: {
    marginBottom: 7,
    fontSize: 18,
    fontWeight: 800,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 7,
  },
}

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
