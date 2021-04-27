import React, { Component } from "react"
import Tooltip from "@material-ui/core/Tooltip"
import { ReactComponent as FeedbackIcon } from "../../../images/Feedback-XL.svg"
import { Typography } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"

const styles = (theme) => {
  return {
    feedbackText: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
  }
}

/**
 * Thic component returns Feedback button
 *
 * @author Richard Brown <richard.brown@synanetics.com>
 */
class FeedbackButton extends Component {
  render() {
    const { classes } = this.props

    return (
      <Tooltip title="Feedback">
        <a
          aria-label="Feedback"
          href="mailto:info@myhelm.org?subject=User%20Feedback%20from%20Helm"
          style={{ textDecoration: "none", display: "inline-block", color: "inherit" }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <FeedbackIcon width={40} height={40} title="Feedback" />
            <Typography className={classes.feedbackText} style={{ marginLeft: 20, fontWeight: "bold" }}>
              FEEDBACK
            </Typography>
          </div>
        </a>
      </Tooltip>
    )
  }
}

export default withStyles(styles)(FeedbackButton)
