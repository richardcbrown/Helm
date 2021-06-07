import React, { Component } from "react"
import { connect } from "react-redux"
import { setSidebarVisibility } from "react-admin"
import RunUserTour from "./fragments/RunTourButton"
import { setAccessibilityMessage } from "../../../core/actions/accessibilityActions"
import { withStyles } from "@material-ui/core"

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

class UserTour extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shouldRunTour: false,
    }
  }

  /**
   * This function add info to Cookie that user tour was passed
   *
   * @param tour
   */
  callback(tour) {
    const { type } = tour

    if (type === "tour:end") {
      document.cookie = "userTour=passed"
      this.setState({
        shouldRunTour: false,
      })

      this.props.setAccessibilityMessage("User tour finished")
    }
  }

  /**
   * This function runs User Tour
   */
  runTour() {
    this.setState({ shouldRunTour: true }, this.props.setSidebarVisibility(false))

    this.props.setAccessibilityMessage("User tour started")
  }

  render() {
    const { classes } = this.props
    const { shouldRunTour } = this.state

    return (
      <div className={classes.rightBlockItem}>
        <RunUserTour
          classes={classes}
          runTour={() => this.runTour()}
          shouldRunTour={shouldRunTour}
          callback={(tour) => this.callback(tour)}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isSidebarOpen: state.admin.ui.sidebarOpen,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSidebarVisibility(params) {
      dispatch(setSidebarVisibility(params))
    },
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserTour))
