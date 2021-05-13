import React, { Component, useEffect, useState } from "react"
import { connect } from "react-redux"
import moment from "moment"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import CreateFormToolbar from "../../common/Toolbars/CreateFormDialogToolbar"
import TableHeader from "../../../core/common/TableHeader"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import backgroundImage from "../../images/Artboard.png"
import {
  Typography,
  TextField,
  Paper,
  FormGroup,
  FormControl,
  FormHelperText,
  IconButton,
  CircularProgress,
} from "@material-ui/core"
import { getFhirResourcesAction } from "../../actions/getFhirResourcesAction"
import querystring from "query-string"
import { getFromBundle } from "../../fhir/GetFromBundle"
import { createFhirResourceAction } from "../../actions/createFhirResourceAction"
import { Info } from "@material-ui/icons"
import GeneralDialog from "../../common/Dialogs/GeneralDialog"
import ConfirmButton from "../../common/Buttons/ConfirmButton"
import { PageTitle } from "../../../core/common/PageTitle"
import { setAccessibilityMessage } from "../../../core/actions/accessibilityActions"

const styles = {
  createBlock: {
    padding: "24px",
    background: `url(${backgroundImage})`,
    backgroundSize: "cover",
  },
  labelBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  labelBlockTitle: {
    marginTop: 16,
    marginBottom: 8,
    width: 256,
  },
}

const CharacterCount = ({ value, limit }) => {
  if (!limit) {
    return null
  }

  const remaining = limit - (value ? value.length : 0)

  return (
    <Typography>
      {remaining}/{limit} characters remaining
    </Typography>
  )
}

const conditionalRequired = (message, target) => (value, allValues) => {
  const targetValue = allValues[target]

  if (targetValue && !value) {
    return message
  }

  return undefined
}

/**
 *
 * @param {fhir.QuestionnaireItem[] | fhir.QuestionnaireResponseItem[]} items
 * @returns {fhir.QuestionnaireItem[] | fhir.QuestionnaireResponseItem[]}
 */
const flattenItems = (items) => {
  const flattened = []

  items.forEach((item) => {
    if (item.item) {
      const subItems = item.item

      if (!subItems || !subItems.length) {
        return
      }

      flattened.push(...subItems.map((si) => ({ ...si, linkId: `${item.linkId}::${si.linkId}` })))
    } else {
      flattened.push(item)
    }
  })

  return flattened
}

/**
 * @param {fhir.QuestionnaireResponseItem} item
 * @returns {boolean}
 */
const isEmptyGroup = (item) => {
  // not a group item
  if (!item.item) {
    return false
  }

  const completedAnswers = item.item.map((item) => !!(item.answer && item.answer[0] && item.answer[0].valueString))

  // check if every item in group is unanswered
  return completedAnswers.every((completed) => !completed)
}

/**
 * @param {fhir.QuestionnaireResponseItem[]} responseItems
 * @returns {fhir.QuestionnaireResponseItem[]}
 */
const rebuildItems = (responseItems) => {
  const rebuiltItems = []

  responseItems.forEach((ri) => {
    const [groupId, subLinkId] = ri.linkId.split("::")

    // item not in a group
    if (!subLinkId) {
      responseItems.push({ ...ri, linkId: groupId })
    }

    const groupItem = rebuiltItems.find((ri) => ri.linkId === groupId)

    if (groupItem) {
      groupItem.item = groupItem.item || []
      groupItem.item.push({ ...ri, linkId: subLinkId })
    } else {
      rebuiltItems.push({
        linkId: groupId,
        item: [{ ...ri, linkId: subLinkId }],
      })
    }
  })

  return rebuiltItems.filter((ri) => !isEmptyGroup(ri))
}

/**
 * @typedef {Object} QuestionnaireResponseItemCreatorProps
 * @property {fhir.QuestionnaireItem} item
 * @property {fhir.QuestionnaireResponseItem} responseItem
 * @property {(item: fhir.QuestionnaireResponseItem) => void} onItemChange
 */

/**
 * @type {import('react').FunctionComponent<QuestionnaireResponseItemCreatorProps>}
 */
const QuestionnaireResponseItemCreator = ({ classes, item, setValue, value, error, errorMessage, children }) => {
  const { type } = item

  switch (type) {
    case "string":
    case "text": {
      const name = (item.text || item.prefix || "").replace(" ", "-")

      return (
        <>
          {children ? (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <FormControl className={type === "text" ? classes.labelBlock : classes.labelBlockTitle}>
                <TextField
                  name={name}
                  id={name}
                  error={error}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  label={item.prefix || item.text}
                  InputLabelProps={{
                    "aria-label": `Enter ${item.text || item.prefix}`,
                    for: name,
                  }}
                  fullWidth={type === "text"}
                />
                {!error ? (
                  <CharacterCount limit={item.maxLength} value={value} />
                ) : (
                  <FormHelperText error={error}>{errorMessage}</FormHelperText>
                )}
              </FormControl>
              {children ? children : null}
            </div>
          ) : (
            <FormControl className={type === "text" ? classes.labelBlock : classes.labelBlockTitle}>
              <TextField
                name={name}
                id={name}
                error={error}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                label={item.prefix || item.text}
                fullWidth={type === "text"}
                InputLabelProps={{
                  "aria-label": `Enter ${item.text || item.prefix}`,
                  for: name,
                }}
              />
              {!error ? (
                <CharacterCount limit={item.maxLength} value={value} />
              ) : (
                <FormHelperText error={error}>{errorMessage}</FormHelperText>
              )}
            </FormControl>
          )}
        </>
      )
    }
    default: {
      throw Error(`Type ${type} not supported`)
    }
  }
}

/**
 * @typedef {Object} QuestionnaireResponseCreatorProps
 * @property {fhir.Questionnaire} questionnaire
 * @property {(response: fhir.QuestionnaireResponse) => void} createQuestionnaireResponse
 */

/**
 * @type {import('react').FunctionComponent<QuestionnaireResponseCreatorProps>}
 */
const QuestionnaireResponseCreator = ({
  questionnaire,
  createQuestionnaireResponse,
  questionnaireResponse,
  validators,
  classes,
}) => {
  const { item } = questionnaire

  const [errors, setErrors] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)

  /**
   * @type {fhir.QuestionnaireResponseItem[]}
   */
  const initialResponseItems = []

  const [responseItems, setResponseItems] = useState(initialResponseItems)

  useEffect(() => {
    if (questionnaireResponse) {
      const item = questionnaireResponse.item || []

      const existingItems = flattenItems(item)

      const filteredInitialItems = responseItems.filter((ri) => !existingItems.some((ei) => ei.linkId === ri.linkId))

      setResponseItems([...existingItems, ...filteredInitialItems])
    }
  }, [questionnaireResponse])

  useEffect(() => {
    if (questionnaireResponse) {
      return
    }

    const initialItems = flattenItems(questionnaire.item || []).map((item) => ({
      linkId: item.linkId,
    }))

    setResponseItems(initialItems)
  }, [questionnaire])

  const flattenedItems = flattenItems(item)

  if (!item) {
    return null
  }

  /**
   * @param {string} itemKey
   * @param {string} answerItem
   */
  function setResponseValue(itemKey, answerItem) {
    const filteredResponses = responseItems.filter((ri) => ri.linkId !== itemKey)
    const newResponseItems = [...filteredResponses, { linkId: itemKey, answer: [{ valueString: answerItem }] }]

    const questionItem = flattenedItems.find((fi) => fi.linkId === itemKey)

    const results = validators
      .map((validate) => validate(newResponseItems, questionItem))
      .reduce((a, b) => a.concat(b, []))

    let deduplictedErrors = []

    for (let i = results.length - 1; i >= 0; i--) {
      const current = results[i]

      if (!deduplictedErrors.find((de) => de.linkId === current.linkId)) {
        deduplictedErrors.push(current)
      }

      if (current.error === false) {
        continue
      }

      deduplictedErrors = deduplictedErrors.filter((de) => de.linkId !== current.linkId)

      deduplictedErrors.push(current)
    }

    const existingErrors = errors.filter((error) => !deduplictedErrors.some((res) => res.linkId === error.linkId))

    setErrors([...deduplictedErrors, ...existingErrors])
    setResponseItems(newResponseItems)
  }

  function getResponseValue(itemKey) {
    const responseItem = responseItems.find((item) => item.linkId === itemKey)

    if (!responseItem) {
      return ""
    }

    const { answer } = responseItem

    if (!answer) {
      return ""
    }

    const [firstAnswer] = answer

    return (firstAnswer && firstAnswer.valueString) || ""
  }

  function disabled() {
    return (
      errors.some((err) => err.error === true) ||
      responseItems.every((ri) => {
        const { answer } = ri

        return !answer || !answer[0] || !answer[0].valueString
      })
    )
  }

  return (
    <>
      <GeneralDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={"Top Three Things Advice"}
        message={
          "Please use this space to tell us three things you feel it would be helpful for your healthcare professional to know, which may not be in your existing health and care record. This might include details such as being a carer and for whom, challenges you have with communicating or emergency contact information. It can be anything you think would be useful and matters to you."
        }
        options={[<ConfirmButton label="Ok" onClick={() => setDialogOpen(false)} />]}
      />
      <Grid container spacing={0} style={{ margin: 0, width: "100%" }}>
        <Grid item container spacing={4} style={{ margin: 0, width: "100%" }} xs={12}>
          <Grid item xs={12}>
            <FormGroup>
              {flattenedItems.map((fi, index) => {
                const { error, errorMessage } = errors.find((err) => err.item === fi.linkId) || {}

                return (
                  <>
                    {index === 0 ? (
                      <QuestionnaireResponseItemCreator
                        classes={classes}
                        value={getResponseValue(fi.linkId)}
                        error={error}
                        errorMessage={errorMessage}
                        item={fi}
                        setValue={(value) => setResponseValue(fi.linkId, value)}
                      >
                        {
                          <IconButton aria-label="Top Three Things Advice" onClick={() => setDialogOpen(true)}>
                            <Info />
                          </IconButton>
                        }
                      </QuestionnaireResponseItemCreator>
                    ) : (
                      <QuestionnaireResponseItemCreator
                        classes={classes}
                        value={getResponseValue(fi.linkId)}
                        error={error}
                        errorMessage={errorMessage}
                        item={fi}
                        setValue={(value) => setResponseValue(fi.linkId, value)}
                      />
                    )}
                  </>
                )
              })}

              <FormControl>
                <TextField
                  className={classes.labelBlock}
                  label="Author"
                  defaultValue={localStorage.getItem("username")}
                  disabled={true}
                  fullWidth
                />
              </FormControl>
              <FormControl>
                <TextField
                  className={classes.labelBlock}
                  label="Date"
                  defaultValue={moment().format("MM/DD/YYYY")}
                  disabled={true}
                  fullWidth
                />
              </FormControl>
            </FormGroup>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <CreateFormToolbar
            handleSave={() => {
              /** @type {fhir.QuestionnaireResponse} */
              const questionnaireResponse = {
                resourceType: "QuestionnaireResponse",
                status: "completed",
                authored: new Date().toISOString(),
              }

              questionnaireResponse.questionnaire = {
                reference: `${questionnaire.resourceType}/${questionnaire.id}`,
              }

              questionnaireResponse.item = rebuildItems(responseItems)

              createQuestionnaireResponse(questionnaireResponse)
            }}
            disabled={disabled()}
          />
        </Grid>
      </Grid>
    </>
  )
}

/**
 * This component returns TopThreeThings creation form
 *
 * @author Richard Brown
 * @param {Object} classes
 * @param {Object} rest
 */
class TopThreeThingsCreate extends Component {
  constructor(props) {
    super(props)

    this.nameOneValidator = conditionalRequired("Subject is required", "description1")
    this.nameTwoValidator = conditionalRequired("Subject is required", "description2")
    this.nameThreeValidator = conditionalRequired("Subject is required", "description3")

    this.state = {
      responseRequested: false,
    }
  }

  componentDidMount() {
    window.analytics.page({ url: window.location.hash })

    const { resourceType, query, getBundle, componentKey } = this.props
    getBundle(
      "TopThreeThings",
      "Questionnaire",
      querystring.stringify({ identifier: "https://fhir.myhelm.org/questionnaire-identifier|topThreeThings" })
    )
  }

  componentDidUpdate() {
    const { questionnaire, getBundle } = this.props
    const { responseRequested } = this.state

    if (!questionnaire || responseRequested) {
      return
    }

    this.setState({ responseRequested: true })

    this.getQuestionnaireResponse()
  }

  getQuestionnaireResponse() {
    const { questionnaire, getBundle } = this.props

    if (!questionnaire) {
      return
    }

    getBundle(
      "TopThreeThings",
      "QuestionnaireResponse",
      querystring.stringify({
        questionnaire: `${questionnaire.resourceType}/${questionnaire.id}`,
        _sort: "-authored",
        _count: 1,
      })
    )
  }

  render() {
    const { classes, createResource, questionnaire, questionnaireResponse, loading } = this.props

    const resourceUrl = "top3Things"
    const title = "Top Three Things"

    const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

    const maxLengthValidator = (responseItems, questionItem) => {
      const responseItem = responseItems.find((ri) => ri.linkId === questionItem.linkId)

      if (!questionItem.maxLength) {
        return [
          {
            item: responseItem.linkId,
            error: false,
          },
        ]
      }

      if (!responseItem) {
        return [
          {
            item: responseItem.linkId,
            error: false,
          },
        ]
      }

      const { answer } = responseItem

      if (!answer) {
        return [
          {
            item: responseItem.linkId,
            error: false,
          },
        ]
      }

      const answerString = answer[0].valueString || ""

      if (answerString.length <= questionItem.maxLength) {
        return [
          {
            item: responseItem.linkId,
            error: false,
          },
        ]
      }

      return [
        {
          item: responseItem.linkId,
          error: true,
          errorMessage: `Must be ${questionItem.maxLength} characters or less`,
        },
      ]
    }

    const groupCompletedValidator = (responseItems, questionItem) => {
      const group = questionItem.linkId.split("::")[0]

      const groupItems = responseItems.filter((ri) => ri.linkId.startsWith(group))

      const anyCompleted = groupItems.some((gi) => ((gi.answer || [])[0] || {}).valueString)

      if (!anyCompleted) {
        return groupItems.map((gi) => ({ item: gi.linkId, error: false }))
      }

      const incompleteItems = groupItems.filter(
        (gi) => gi.linkId.includes("title") && !!!((gi.answer || [])[0] || {}).valueString
      )

      console.log(incompleteItems)

      return incompleteItems.map((ii) => ({ item: ii.linkId, error: true, errorMessage: "Subject is required" }))
    }

    return (
      <>
        <PageTitle />
        <Breadcrumbs resource={breadcrumbsResource} />
        <TableHeader resource={resourceUrl} />

        <syn-canvas library-root="http://localhost:8882/registry">
          <syn-panel panel-id="test-panel" panel="sample-panel"></syn-panel>
        </syn-canvas>

        <Grid item xs={12} sm={12} className={classes.createBlock}>
          {questionnaire && !loading ? (
            <Paper elevation={0}>
              <QuestionnaireResponseCreator
                classes={classes}
                questionnaire={questionnaire}
                questionnaireResponse={questionnaireResponse}
                createQuestionnaireResponse={(resource) =>
                  createResource({ resource, completedAction: () => this.getQuestionnaireResponse() })
                }
                validators={[maxLengthValidator, groupCompletedValidator]}
              />
            </Paper>
          ) : (
            <Paper elevation={0}>
              <Grid container spacing={0}>
                <Grid item xs={12} style={{ position: "relative", height: 300 }}>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3596f4",
                    }}
                  >
                    <CircularProgress size={70} color="inherit" />
                  </div>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { fhir, createFhirResource } = state.custom

  //const { componentKey, resourceType } = ownProps

  const componentKey = "TopThreeThings"
  const questionnaireResourceType = "Questionnaire"
  const questionnaireResponseResourceType = "QuestionnaireResponse"

  const createResource =
    (createFhirResource[componentKey] &&
      createFhirResource[componentKey][questionnaireResponseResourceType] &&
      createFhirResource[componentKey][questionnaireResponseResourceType]) ||
    {}

  const questionnaireData =
    (fhir[componentKey] &&
      fhir[componentKey][questionnaireResourceType] &&
      fhir[componentKey][questionnaireResourceType]) ||
    {}

  const questionnaireResponseData =
    (fhir[componentKey] &&
      fhir[componentKey][questionnaireResponseResourceType] &&
      fhir[componentKey][questionnaireResponseResourceType]) ||
    {}

  const questionnaire = /** @type {fhir.Questionnaire | null} */ ((questionnaireData &&
    questionnaireData.data &&
    getFromBundle(questionnaireData.data, questionnaireResourceType)[0]) ||
    null)

  const questionnaireResponse = /** @type {fhir.QuestionnaireResponse | null} */ ((questionnaireResponseData &&
    questionnaireResponseData.data &&
    getFromBundle(questionnaireResponseData.data, questionnaireResponseResourceType)[0]) ||
    null)

  return {
    questionnaire,
    questionnaireResponse,
    loading: questionnaireData.loading || questionnaireResponseData.loading || createResource.loading,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getBundle: (key, resourceType, query) => dispatch(getFhirResourcesAction.request(key, resourceType, query)),
    createResource: ({ resource, completedAction }) =>
      dispatch(
        createFhirResourceAction.request("TopThreeThings", "QuestionnaireResponse", { resource, completedAction })
      ),
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TopThreeThingsCreate))
