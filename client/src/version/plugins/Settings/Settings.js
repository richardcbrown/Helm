import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  makeStyles,
  Radio,
  RadioGroup,
  SvgIcon,
  Typography,
} from "@material-ui/core"
import get from "lodash/get"
import React, { useState } from "react"
import backgroundImage from "../../images/Artboard.png"
import { connect } from "react-redux"
import { savePreferencesAction } from "../../actions/preferencesActions"
import { usePrimaryAccordionStyles } from "../../common/Styles/AccordionStyles"
import { ReactComponent as ChevronUp } from "../../images/Icons/Chevron-down.svg"
import { ReactComponent as Tick } from "../../images/Icons/Tick.svg"
import { useEffect } from "react"
import ConfirmButton from "../../common/Buttons/ConfirmButton"
import Breadcrumbs from "../../../core/common/Breadcrumbs"
import TableHeader from "../../../core/common/TableHeader"
import { usePrimaryCheckboxStyles, usePrimaryRadioStyles } from "../../common/Styles/CheckboxStyles"
import { CenterLoader } from "../../common/Loader"
import { PageTitle } from "../../../core/common/PageTitle"
import { setAccessibilityMessage } from "../../../core/actions/accessibilityActions"

const useStyles = makeStyles({
  createBlock: {
    background: `url(${backgroundImage})`,
    backgroundSize: "cover",
    margin: 0,
    width: "100%",
    height: "100%",
    alignContent: "flex-start",
  },
})

const RadioControl = ({ item, value, setValue }) => {
  const radioStyles = usePrimaryRadioStyles()

  return (
    <FormControl margin="normal" component="fieldset">
      <FormLabel component="legend">{item.title}</FormLabel>
      <RadioGroup
        aria-label={item.description || item.title}
        name={item.title}
        value={value}
        onChange={(_, value) => setValue(value)}
      >
        {item.enum.map((enumval, index) => (
          <FormControlLabel
            value={enumval}
            control={<Radio color="primary" className={radioStyles.muiRadioRoot} />}
            label={(item.enumLabels && item.enumLabels[index]) || enumval}
          />
        ))}
      </RadioGroup>
      <FormHelperText>{item.description}</FormHelperText>
    </FormControl>
  )
}

const CheckboxControl = ({ item, value, setValue }) => {
  const checkboxStyles = usePrimaryCheckboxStyles()

  return (
    <FormControl margin="normal">
      <FormControlLabel
        aria-label={item.description || item.title}
        control={
          <Checkbox
            className={checkboxStyles.muiCheckboxRoot}
            checked={value}
            color="primary"
            checkedIcon={
              <SvgIcon viewBox="0 0 27 20" fontSize="small" className={checkboxStyles.checkboxIcon}>
                <Tick />
              </SvgIcon>
            }
            onChange={() => setValue(!value)}
          />
        }
        label={item.title}
      />
      <FormHelperText>{item.description}</FormHelperText>
    </FormControl>
  )
}

function getEditorForPreferenceItem(item, value, setValue) {
  switch (item.editor) {
    case "radio": {
      return <RadioControl item={item} value={value} setValue={setValue} />
    }
    default: {
      return null
    }
  }
}

function getEditorForPreferenceItemByType(item, value, setValue) {
  switch (item.type) {
    case "boolean": {
      return <CheckboxControl item={item} value={value} setValue={setValue} />
    }
    case "link": {
      return (
        <a href={item.url} target={item.target} rel="noopener noreferrer">
          <Typography>{item.title}</Typography>
        </a>
      )
    }
    default: {
      return null
    }
  }
}

const SettingsSection = ({ index, preferences, getPreferenceValue, setPreferenceValue, title, schemaItem }) => {
  const accordionStyles = usePrimaryAccordionStyles()

  return (
    <Grid item xs={12}>
      <Accordion className={accordionStyles.container}>
        <AccordionSummary
          expandIcon={
            <SvgIcon viewBox="0 0 18 11" fontSize="small" className={accordionStyles.icon}>
              <ChevronUp />
            </SvgIcon>
          }
          aria-controls={`panel${index}a-content`}
          id={`panel${index}a-header`}
          className={accordionStyles.mainHeader}
        >
          <Typography variant="h5">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {Object.keys(preferences).map((pref) => {
              const item = preferences[pref]
              const settingKey = [schemaItem, "preferences", pref].join(".")

              if (item.editor) {
                return getEditorForPreferenceItem(item, getPreferenceValue(settingKey, item.defaultValue), (value) =>
                  setPreferenceValue(settingKey, value)
                )
              }

              if (item.type) {
                return getEditorForPreferenceItemByType(
                  item,
                  getPreferenceValue(settingKey, item.defaultValue),
                  (value) => setPreferenceValue(settingKey, value)
                )
              }
            })}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </Grid>
  )
}

const Settings = (props) => {
  const { savePreferences, setAccessibilityMessage } = props

  const accessibilitySavePreferences = (preferences) => {
    savePreferences(preferences)
    setAccessibilityMessage("Saving user preferences")
  }

  const [selectedPreferences, setSelectedPreferences] = useState({})

  useEffect(() => {
    window.analytics.page({ url: window.location.hash })
  }, [])

  useEffect(() => {
    const preferences = (props.preferences && props.preferences.data && props.preferences.data.preferences) || {}

    setSelectedPreferences(preferences)
    setAccessibilityMessage("User preferences loaded")
  }, [props.preferences])

  const classes = useStyles()

  const { data, loading } = props.preferences

  function getPreferenceValue(key, defaultValue) {
    return selectedPreferences[key] !== undefined ? selectedPreferences[key] : defaultValue
  }

  function setPreferenceValue(key, value) {
    const newPreferences = { ...selectedPreferences }

    newPreferences[key] = value

    setSelectedPreferences(newPreferences)
  }

  const resourceUrl = "settings"
  const title = "Settings"

  const breadcrumbsResource = [{ url: "/" + resourceUrl, title: title, isActive: false }]

  return (
    <React.Fragment>
      <PageTitle />
      <Breadcrumbs resource={breadcrumbsResource} />
      <TableHeader resource={resourceUrl} />
      <Grid container spacing={4} className={classes.createBlock}>
        <CenterLoader
          loading={loading || !data || !data.schema}
          loaded={() => {
            return (
              <>
                {Object.keys(data.schema).map((schemaItem, index) => {
                  const { title, preferences } = data.schema[schemaItem]

                  return (
                    <SettingsSection
                      title={title}
                      index={index}
                      preferences={preferences}
                      getPreferenceValue={getPreferenceValue}
                      setPreferenceValue={setPreferenceValue}
                      schemaItem={schemaItem}
                    />
                  )
                })}

                <Grid
                  item
                  xs={12}
                  style={{ flexBasis: "initial", flexGrow: 1, display: "flex", alignItems: "flex-end" }}
                >
                  <ConfirmButton
                    label="Save"
                    aria-label="Save preferences"
                    onClick={() => accessibilitySavePreferences(selectedPreferences)}
                  />
                </Grid>
              </>
            )
          }}
        />
      </Grid>
    </React.Fragment>
  )
}

const mapStateToProps = (state) => {
  const preferences = get(state, "custom.preferences", {})
  return {
    preferences,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    savePreferences: (preferences) => dispatch(savePreferencesAction.request(preferences)),
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
