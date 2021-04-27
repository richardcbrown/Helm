import React, { Component } from "react"
import { connect } from "react-redux"

import IconButton from "@material-ui/core/IconButton"
import ContrastIcon from "@material-ui/icons/Tonality"
import Tooltip from "@material-ui/core/Tooltip"

import { get } from "lodash"
import { savePreferencesAction } from "../../actions/preferencesActions"
import { setAccessibilityMessage } from "../../../core/actions/accessibilityActions"

/**
 * Thic component returns Contrast Mode button
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
class ContrastMode extends Component {
  constructor(props) {
    super(props)
  }

  toggleContrastMode() {
    const { contrastMode, preferences, savePreferences, setAccessibilityMessage } = this.props

    const userPrefs = (preferences && preferences.data && preferences.data.preferences) || null

    if (!userPrefs) {
      return
    }

    const newContrastMode = !contrastMode

    userPrefs["general.preferences.contrastMode"] = newContrastMode

    setAccessibilityMessage(`Turning contrast mode ${newContrastMode ? "on" : "off"}`)

    savePreferences(userPrefs)
  }

  render() {
    const { classes, contrastMode } = this.props
    return (
      <div className={classes.rightBlockItem}>
        <Tooltip title="Contrast mode">
          <IconButton
            className={classes.rightBlockButton}
            aria-haspopup="true"
            onClick={() => this.toggleContrastMode()}
            aria-label="Contrast mode"
          >
            <ContrastIcon />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const preferences = get(state, "custom.preferences", {})

  const userPrefs = (preferences && preferences.data && preferences.data.preferences) || {}

  const contrastMode = get(userPrefs, "general.preferences.contrastMode", false)

  return {
    contrastMode,
    preferences,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    savePreferences: (preferences) => dispatch(savePreferencesAction.request(preferences)),
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContrastMode)
