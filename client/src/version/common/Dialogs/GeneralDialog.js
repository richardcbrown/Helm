import React, { Component } from "react"

import { withStyles } from "@material-ui/core/styles"
import Dialog from "@material-ui/core/Dialog"
import Typography from "@material-ui/core/Typography"
import withMobileDialog from "@material-ui/core/withMobileDialog"
import { getCurrentTheme } from "../../../core/config/styles"

const styles = (theme) => {
  theme = theme.palette.mainColor ? theme : getCurrentTheme()

  return {
    dialogBlock: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      [theme.breakpoints.only("xs")]: {
        paddingTop: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
      [theme.breakpoints.up("sm")]: {
        minHeight: 300,
        minWidth: 500,
        marginBottom: 10,
      },
    },
    titleBlock: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: 48,
      paddingLeft: 20,
      backgroundColor: theme.palette.mainColor,
      color: "#fff",
      fontSize: 18,
      fontWeight: 800,
    },
    description: {
      padding: 20,
      fontSize: 15,
      textAlign: "center",
    },
    toolbar: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      marginRight: 15,
    },
    reloadButton: {
      padding: 6,
      display: "block",
      width: 140,
      height: 40,
      margin: "8px !important",
      color: "white",
      backgroundColor: theme.palette.dangerColor,
      borderRadius: 25,
      fontSize: 16,
      fontWeight: 800,
      "&:hover": {
        color: theme.palette.dangerColor,
        backgroundColor: "white",
      },
    },
  }
}

class GeneralDialog extends Component {
  render() {
    const { classes, title, message, options, open, onClose, ...rest } = this.props

    return (
      <React.Fragment>
        <Dialog
          disableAutoFocus={true}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          onBackdropClick={() => onClose()}
          open={open}
          {...rest}
        >
          <div className={classes.dialogBlock}>
            <Typography id="dialog-title" className={classes.titleBlock}>
              {title}
            </Typography>
            <Typography id="dialog-description" className={classes.description}>
              <div dangerouslySetInnerHTML={{ __html: message }}></div>
            </Typography>
            <div className={classes.toolbar}>{options.map((o) => o)}</div>
          </div>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(withMobileDialog({ breakpoint: "xs" })(GeneralDialog))
