import React from "react"
import Joyride from "react-joyride"

import IconButton from "@material-ui/core/IconButton"
import HelpIcon from "@material-ui/icons/Help"
import Tooltip from "@material-ui/core/Tooltip"

import { tourSteps, locale } from "../content"
import toursStyles from "../styles"

/**
 * This component returns button which run User Tour
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape}   classes
 * @param {func}    runTour
 * @param {boolean} isPassed
 * @param {func}    callback
 * @constructor
 */
const RunUserTour = ({ classes, runTour, shouldRunTour, callback }) => {
  return (
    <React.Fragment>
      <Tooltip title="User Tour">
        <IconButton
          id="icon-tour"
          className={classes.rightBlockButton}
          aria-haspopup="true"
          aria-label="Tour"
          onClick={() => runTour()}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      <Joyride
        continuous
        disableOverlayClose={true}
        showSkipButton={true}
        showProgress={true}
        locale={locale}
        steps={tourSteps}
        run={shouldRunTour}
        styles={toursStyles}
        callback={callback}
      />
    </React.Fragment>
  )
}

export default RunUserTour
