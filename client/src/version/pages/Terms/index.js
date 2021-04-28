import React, { Component } from "react"
import { connect } from "react-redux"
import { withStyles } from "@material-ui/core/styles"
import Checkbox from "@material-ui/core/Checkbox"
import Typography from "@material-ui/core/Typography"
import ConfirmButton from "../../common/Buttons/ConfirmButton"
import { acceptTermsAction } from "../../actions/acceptTermsAction"
import { getTermsAction } from "../../actions/getTermsAction"
import TopBarNoUser from "../../common/TopBarNoUser"
import backgroundImage from "../../images/Artboard.png"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import GeneralDialog from "../../common/Dialogs/GeneralDialog"
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Hidden, Paper } from "@material-ui/core"
import Bowser from "bowser"
import { PageTitle } from "../../../core/common/PageTitle"

const browser = Bowser.getParser(window.navigator.userAgent)
const isIe = browser.getBrowserName() === "Internet Explorer"
const isSafari = browser.getBrowserName() === "Safari"

const styles = (theme) => {
  return {
    termsBackground: {
      position: "absolute",
      top: 0,
      zIndex: -1,
      width: "100%",
      height: "100%",
      background: `url(${backgroundImage}) 0 0 repeat`,
    },
    termsContainer: {
      height: "calc(100% - 54px)",
      width: "100%",
    },
    policyAcceptContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
    },
    contentContainer: {
      margin: 0,
      height: "100%",
      width: "100%",
      overflowY: "auto",
      flexWrap: "nowrap",
      flexDirection: "column",
    },
    declarationContainer: {
      overflowY: "auto",
    },
    continue: {
      padding: "10px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    mobileHeader: {
      width: "100%",
      margin: 0,
    },
  }
}

class Terms extends Component {
  constructor(props) {
    super(props)

    this.state = {
      acceptedPolicies: [],
      expandedPolicies: {},
    }
  }

  componentDidMount() {
    this.props.getTermsAction()
  }

  render() {
    const { policies, classes, error } = this.props
    const { closeDialog } = this
    const allAccepted = this.allPoliciesAccepted()
    const { expandedPolicies } = this.state

    const containerStyle = {
      width: "100%",
      margin: 0,
      flexDirection: "column",
      flexWrap: "nowrap",
      height: isIe || isSafari ? "initial" : "100%",
      display: isIe || isSafari ? "block" : "flex",
    }

    return (
      <>
        <PageTitle />

        <TopBarNoUser />

        <div className={classes.termsContainer}>
          <div className={classes.termsBackground}></div>

          <div className={classes.contentContainer}>
            <Grid container spacing={4} style={containerStyle}>
              <Grid item xs={12} style={{ flexBasis: "initial" }}>
                <Paper>
                  <Grid container spacing={4} style={{ width: "100%", margin: 0 }}>
                    <Grid item xs={12}>
                      <Typography>
                        Important, please read to ensure you understand how your information will be processed
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {error ? (
                <GeneralDialog
                  open={true}
                  onClose={closeDialog}
                  title={error.title}
                  message={error.message}
                  options={[<ConfirmButton label="Ok" onClick={() => this.closeDialog()} />]}
                />
              ) : (
                policies.map((p, key) => {
                  const shouldShow = !!expandedPolicies[key] || Object.values(expandedPolicies).every((val) => !!!val)

                  return (
                    <React.Fragment>
                      {shouldShow && (
                        <Grid item xs={12} style={{ flexBasis: "initial" }}>
                          <ExpansionPanel
                            style={{ borderRadius: 4, marginBottom: 16 }}
                            expanded={expandedPolicies[key] === true}
                            onChange={() => this.handleExpand(key)}
                          >
                            <ExpansionPanelSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls={`panel-${key}-content`}
                              id={`panel-${key}-header`}
                            >
                              <Typography variant="h4" className={classes.heading}>
                                {p.name}
                              </Typography>
                            </ExpansionPanelSummary>

                            <Hidden mdUp>
                              <div style={{ overflowY: "auto", height: 200 }}>
                                <ExpansionPanelDetails>
                                  <Typography>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: p.narrative,
                                      }}
                                    ></div>
                                  </Typography>
                                </ExpansionPanelDetails>
                              </div>
                            </Hidden>
                            <Hidden smDown>
                              <div style={{ overflowY: "auto" }}>
                                <ExpansionPanelDetails>
                                  <Typography>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: p.narrative,
                                      }}
                                    ></div>
                                  </Typography>
                                </ExpansionPanelDetails>
                              </div>
                            </Hidden>
                          </ExpansionPanel>

                          <Card className={classes.policyAcceptContainer}>
                            <Checkbox
                              checked={this.policyAccepted(p)}
                              color="primary"
                              onChange={() => this.acceptPolicy(p)}
                            />
                            <Typography>{`I Accept ${p.name}`}</Typography>
                          </Card>
                        </Grid>
                      )}
                    </React.Fragment>
                  )
                })
              )}

              <Grid item xs={12} style={{ flexBasis: "initial", flexGrow: 1, display: "flex", alignItems: "flex-end" }}>
                <Card className={classes.continue}>
                  <ConfirmButton label="Continue" disabled={!allAccepted} onClick={() => this.accept()} />
                  <a href="https://myhelm.org" onClick={() => this.closeDialog()}>
                    <Typography>{"I do not want to use Helm >"}</Typography>
                  </a>
                </Card>
              </Grid>
            </Grid>
          </div>
        </div>
      </>
    )
  }

  handleExpand(key) {
    let { expandedPolicies } = this.state

    expandedPolicies[key] = !!!expandedPolicies[key]

    Object.keys(expandedPolicies).forEach((item) => {
      if (item !== `${key}`) {
        expandedPolicies[item] = false
      }
    })

    this.setState({ expandedPolicies })
  }

  accept() {
    const { acceptedPolicies } = this.state

    if (!this.allPoliciesAccepted()) {
      return
    }

    this.props.acceptTermsAction(acceptedPolicies)
  }

  acceptPolicy(policy) {
    const { acceptedPolicies, expandedPolicies } = this.state

    Object.keys(expandedPolicies).forEach((item) => {
      expandedPolicies[item] = false
    })

    if (acceptedPolicies.find((p) => p.id === policy.id)) {
      this.setState({ acceptedPolicies: acceptedPolicies.filter((p) => p.id !== policy.id), expandedPolicies })
      return
    }

    this.setState({ acceptedPolicies: [...acceptedPolicies, policy], expandedPolicies })
  }

  policyAccepted(policy) {
    const { acceptedPolicies } = this.state

    return !!acceptedPolicies.find((p) => p.id === policy.id)
  }

  allPoliciesAccepted() {
    const { policies } = this.props

    if (!policies.length) {
      return false
    }

    for (let i = 0; i < policies.length; i++) {
      if (!this.policyAccepted(policies[i])) {
        return false
      }
    }

    return true
  }

  closeDialog() {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("username")
    localStorage.removeItem("role")
    return false
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    acceptTermsAction(policies) {
      dispatch(acceptTermsAction.request(policies))
    },
    getTermsAction() {
      dispatch(getTermsAction.request())
    },
  }
}

const mapStateToProps = (state) => {
  const { terms } = state.custom
  const policies = state.custom.terms.data || []

  return {
    policies,
    error: terms.error,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Terms))
