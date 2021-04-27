import React, { Component } from "react"

import { withStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import Popover from "@material-ui/core/Popover"
import Card from "@material-ui/core/Card"
import PersonIcon from "@material-ui/icons/Person"
import Tooltip from "@material-ui/core/Tooltip"
import { connect } from "react-redux"
import CustomLogoutButton from "../../../../core/common/Buttons/CustomLogoutButton"
import { ReactComponent as SettingsIcon } from "../../../images/Icons/Settings.svg"
import { SvgIcon } from "@material-ui/core"
import { withRouter } from "react-router-dom"
import { setAccessibilityMessage } from "../../../../core/actions/accessibilityActions"

const styles = (theme) => ({
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
  button: {
    padding: 6,
    display: "block",
    width: 140,
    height: 40,
    margin: "8px !important",
    color: "white",
    backgroundColor: theme.palette.mainColor,
    border: `1px solid ${theme.palette.mainColor}`,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 800,
    "&:hover": {
      color: theme.palette.mainColor,
      backgroundColor: "white",
    },
  },
  icon: {
    marginLeft: 10,
  },
})

/**
 * This component returns User panel popover
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
class UserPanelButton extends Component {
  constructor(props) {
    super(props)
    this.button = React.createRef()

    this.state = {
      anchorEl: null,
      isOpen: false,
    }
  }

  handleMenu() {
    const isOpen = !this.state.isOpen

    this.setState((state) => ({
      anchorEl: this.button.current,
      isOpen,
    }))

    this.props.setAccessibilityMessage(`User menu ${isOpen ? "opened" : "closed"}`)
  }

  handleClose() {
    const isOpen = !this.state.isOpen

    this.setState((state) => ({
      anchorEl: null,
      isOpen,
    }))

    this.props.setAccessibilityMessage(`User menu ${isOpen ? "opened" : "closed"}`)
  }

  render() {
    const { classes, history } = this.props
    const { isOpen, anchorEl } = this.state
    return (
      <div className={classes.rightBlockItem} ref={this.button}>
        <Tooltip title="User panel">
          <IconButton
            id="icon-profile"
            className={classes.rightBlockButton}
            aria-owns={isOpen ? "menu-appbar" : undefined}
            aria-haspopup="true"
            onClick={() => this.handleMenu()}
            aria-label="User Panel"
          >
            <PersonIcon />
          </IconButton>
        </Tooltip>
        <Popover
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={isOpen}
          onClose={() => this.handleClose()}
        >
          <Card className={classes.userPanel}>
            <Typography variant="h1" className={classes.userName}>
              {localStorage.getItem("username")}
            </Typography>
            <Typography className={classes.userRole}>
              <span>User role:</span> {localStorage.getItem("role")}
            </Typography>
            <CustomLogoutButton classes={classes} />

            <IconButton className={classes.button} onClick={() => history.push("/Settings")}>
              Settings
              <SvgIcon className={classes.icon} viewBox="0 0 28 29" fontSize="small">
                <SettingsIcon />
              </SvgIcon>
            </IconButton>
          </Card>
        </Popover>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

export default withStyles(styles)(withRouter(connect(null, mapDispatchToProps)(UserPanelButton)))
