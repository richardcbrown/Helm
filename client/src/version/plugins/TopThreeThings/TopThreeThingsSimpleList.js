import React, { Component } from "react"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import { BundleList } from "../../common/ResourceTemplates/BundleList"
import { v4 as uuidv4 } from "uuid"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import TableHeader from "../../../core/common/TableHeader"
import moment from "moment"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import { withStyles } from "@material-ui/core/styles"
import { getFhirResourcesAction } from "../../actions/getFhirResourcesAction"
import { getFromBundle } from "../../fhir/GetFromBundle"
import { connect } from "react-redux"
import querystring from "query-string"
import { flattenQuestionnaireResponse } from "../../fhir/QuestionnaireResponse"
import { PageTitle } from "../../../core/common/PageTitle"

const listStyles = (theme) => ({
  mainBlock: {
    margin: 0,
    paddingLeft: 10,
    paddingTop: 15,
    paddingRight: 25,
    border: `1px solid ${theme.palette.borderColor}`,
    height: "100%",
  },
  list: {
    paddingLeft: 0,
    display: "flex",
    flexDirection: "column",
  },
  blockTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 49,
    color: "#fff",
    backgroundColor: theme.palette.mainColor,
    fontSize: 18,
    fontWeight: 700,
    paddingLeft: 15,
  },
  emptyBlock: {
    flexGrow: 1,
  },
  title: {
    color: theme.palette.paperColor,
    backgroundColor: theme.palette.mainColor,
    fontSize: 18,
    fontWeight: 700,
  },
  filterInput: {
    backgroundColor: theme.palette.mainColor,
    borderRadius: 0,
    boxShadow: "none",
    "& button": {
      color: "#fff",
    },
  },
  inputBlock: {
    width: "calc(100% - 105px)",
    backgroundColor: "#fff",
    borderRadius: 2,
    paddingLeft: 5,
  },
  tableList: {
    "& thead": {
      "& tr th": {
        paddingLeft: 10,
      },
    },
    "& tbody": {
      "& tr td": {
        paddingLeft: 10,
      },
    },
    "& tbody tr:hover": {
      backgroundColor: theme.palette.mainColor,
    },
    "& tbody tr:hover td": {
      color: theme.palette.common.white,
    },
  },
})

class TopThreeThingsSimpleList extends Component {
  constructor(props) {
    super(props)

    this.bundleListKey = uuidv4()
  }

  componentDidMount() {
    window.analytics.page({ url: window.location.hash })

    const { getBundle } = this.props

    getBundle(
      "TopThreeThingsList",
      "Questionnaire",
      querystring.stringify({ identifier: "https://fhir.myhelm.org/questionnaire-identifier|topThreeThings" })
    )
  }

  render() {
    const { bundleListKey } = this

    const title = "Top Three Things"

    const breadcrumbsResource = [
      { url: "/top3Things", title: title, isActive: true },
      { url: `/top3Things/history`, title: "History", isActive: false },
    ]

    const { classes, questionnaire } = this.props

    return (
      <React.Fragment>
        <PageTitle />
        <Breadcrumbs resource={breadcrumbsResource} />
        <TableHeader resource={"top3Things"} />

        <Grid container spacing={4} className={classes.mainBlock}>
          <Grid className={classes.list} item xs={12}>
            <React.Fragment>
              <div className={classes.blockTitle}>
                <Typography className={classes.title}>{title}</Typography>
                <div className={classes.emptyBlock}></div>
              </div>
            </React.Fragment>
            {questionnaire ? (
              <BundleList
                tableName={"Top three things history"}
                componentKey={bundleListKey}
                tableClass={classes.tableList}
                resourceType="QuestionnaireResponse"
                query={{
                  _sort: "-authored",
                  _count: 10,
                  questionnaire: `${questionnaire.resourceType}/${questionnaire.id}`,
                }}
                headProvider={() => {
                  return (
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <span>Date Created</span>
                        </TableCell>
                        <TableCell>
                          <span>#1</span>
                        </TableCell>
                        <TableCell>
                          <span>#2</span>
                        </TableCell>
                        <TableCell>
                          <span>#3</span>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  )
                }}
                rowProvider={(resource) => {
                  const flattened = flattenQuestionnaireResponse(resource, questionnaire)

                  const { date } = flattened

                  return (
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">{moment(date).format("DD/MM/YYYY")}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{flattened.name1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{flattened.name2}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{flattened.name3}</Typography>
                      </TableCell>
                    </TableRow>
                  )
                }}
              />
            ) : null}
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getBundle: (key, resourceType, query) => dispatch(getFhirResourcesAction.request(key, resourceType, query)),
  }
}

const mapStateToProps = (state) => {
  const { fhir } = state.custom

  const componentKey = "TopThreeThingsList"
  const resourceType = "Questionnaire"

  const questionnaireBundle =
    (fhir[componentKey] && fhir[componentKey][resourceType] && fhir[componentKey][resourceType].data) || null

  const questionnaire = /** @type {fhir.Questionnaire | null} */ ((questionnaireBundle &&
    getFromBundle(questionnaireBundle, "Questionnaire")[0]) ||
    null)

  return {
    questionnaire,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(listStyles)(TopThreeThingsSimpleList))
