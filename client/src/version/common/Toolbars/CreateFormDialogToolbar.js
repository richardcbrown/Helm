import React, { Component } from "react"
import { Toolbar } from "react-admin"
import Button from "@material-ui/core/Button"
import { withStyles } from "@material-ui/core/styles"
import { Link } from "react-router-dom"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import GeneralDialog from "../Dialogs/GeneralDialog"
import { Typography } from "@material-ui/core"
import ConfirmButton from "../../common/Buttons/ConfirmButton"

const styles = (theme) => ({
  toolbar: {
    backgroundColor: theme.palette.toolbarColor,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  createButton: {
    display: "block",
    width: 100,
    height: 40,
    margin: 8,
    padding: 0,
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
  link: {
    marginBottom: "8px",
    marginRight: "8px",
  },
})

class CreateFormDialogToolbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDialog: false,
    }
  }

  render() {
    const { classes, disabled } = this.props
    const { submitting } = this.state

    return (
      <Toolbar className={classes.toolbar} {...this.props}>
        {!submitting ? (
          <Tooltip title="Update">
            <IconButton
              disabled={disabled}
              aria-label="Update"
              className={classes.createButton}
              onClick={() => this.setState({ showDialog: true })}
            >
              Update
            </IconButton>
          </Tooltip>
        ) : null}

        <GeneralDialog
          open={this.state.showDialog}
          onClose={() => this.setState({ showDialog: false })}
          title="Don’t forget:"
          message="You remain responsible for acting on the health concerns you may have. The information you enter here will be shared with health and care practitioners involved in your care."
          options={[
            <Button aria-label="Cancel" onClick={() => this.setState({ showDialog: false })}>
              Cancel
            </Button>,
            <ConfirmButton label="Accept and Continue" onClick={() => this.create()} />,
          ]}
        />
        <Link className={classes.link} to="/top3Things/history">
          <Typography>Show previous entries</Typography>
        </Link>
      </Toolbar>
    )
  }

  create() {
    this.props.handleSave()
    this.setState({ showDialog: false })
  }
}

export default withStyles(styles)(CreateFormDialogToolbar)
