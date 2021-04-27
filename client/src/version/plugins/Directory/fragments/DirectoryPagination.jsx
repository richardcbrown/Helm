import React, { Component } from "react"

import { withStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import FirstPageIcon from "@material-ui/icons/FirstPage"
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"
import Tooltip from "@material-ui/core/Tooltip"

const styles = (theme) => ({
  paginatorRoot: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  button: {
    display: "block",
    border: `1px solid ${theme.palette.borderColor}`,
    height: 48,
    width: 48,
    boxSizing: "border-box",
    borderRadius: 0,
    color: theme.palette.mainColor,
    "&:hover": {
      color: "white",
      backgroundColor: theme.palette.mainColor,
    },
  },
  activeButton: {
    display: "block",
    border: `1px solid ${theme.palette.borderColor}`,
    height: 48,
    width: 48,
    boxSizing: "border-box",
    borderRadius: 0,
    color: "white",
    backgroundColor: theme.palette.mainColor,
    "&:hover": {
      color: "white",
      backgroundColor: theme.palette.mainColor,
    },
  },
})

/**
 * This component returns custom paginator
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
class CustomPaginator extends Component {
  render() {
    const { classes, page, pageSelected, lastPage } = this.props
    return (
      <div className={classes.paginatorRoot}>
        <Tooltip title="Previous page">
          <IconButton
            onClick={() => pageSelected(page - 1)}
            className={classes.button}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <KeyboardArrowLeft />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next page">
          <IconButton
            onClick={() => pageSelected(page + 1)}
            className={classes.button}
            disabled={lastPage}
            aria-label="Next page"
          >
            <KeyboardArrowRight />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}

export default withStyles(styles)(CustomPaginator)
