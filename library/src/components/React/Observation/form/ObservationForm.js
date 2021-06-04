import { FormControl, InputAdornment, Button, Grid, TextField, Typography } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import SaveIcon from "@material-ui/icons/Save"

import { useSelector, useDispatch } from "react-redux"
import { selectObservations, selectPrevResponses } from "../ObservationSlice"
import { selectValue, selectTabTitles } from "../tabs/ObservationTabsSlice"
import {
    selectFieldsArray,
    populateFieldsArray,
    populateFieldsValue,
    selectFieldsValue,
    onFieldsValueChangeHandler,
    onFieldsErrorChangeHandler,
    selectOpen,
    setOpen,
} from "./ObservationFormSlice"
import ObservationDialog from "../Dialog/ObservationDialog"

export default function ObservationForm(props) {
    const observations = useSelector(selectObservations)
    const value = useSelector(selectValue)
    const tabTitles = useSelector(selectTabTitles)
    const fieldsArray = useSelector(selectFieldsArray)
    const fieldsValue = useSelector(selectFieldsValue)
    const open = useSelector(selectOpen)
    const prevResponses = useSelector(selectPrevResponses)
    const dispatch = useDispatch()

    const [errorPresent, setErrorPresent] = useState(false)

    const { saveObservations, getObservations } = props

    useEffect(() => {
        dispatch(populateFieldsArray(observations))
        dispatch(populateFieldsValue(observations))
    }, [observations])

    useEffect(() => {
        getDateNow()
        populateFieldsWithPrevResponse()
    }, [value, prevResponses])

    const populateFieldsWithPrevResponse = () => {
        for (var key in prevResponses[value]) {
            const values = prevResponses[value][key].values
            console.log("values: ", values)
            if (values.length > 0) {
                const payload = {
                    tabNo: value,
                    fieldName: key,
                    newValue: values[values.length - 1].value,
                }
                dispatch(onFieldsValueChangeHandler(payload))
            }
        }
    }

    const getDateNow = () => {
        const date = new Date()
        const [day, month, year] = date.toLocaleDateString("en-GB").split("/")
        const transformedDate = `${year}-${month}-${day}`
        const payload = {
            tabNo: value,
            fieldName: "Date",
            newValue: transformedDate,
        }
        dispatch(onFieldsValueChangeHandler(payload))
    }
    const getFieldsArrayForTab = () => {
        return fieldsArray[value][tabTitles[value]]
    }

    const decimalPlaceCheck = (payload, fieldObj) => {
        const noOfDecimalPlacesEntered = payload.newValue.includes(".")
            ? payload.newValue.split(".")[1].toString().length
            : 0
        if (noOfDecimalPlacesEntered > fieldObj.decimalPlaces) {
            onFieldErrorChange(
                payload.fieldName,
                true,
                `Do not add more than ${fieldObj.decimalPlaces} decimal places to your entry`
            )
            setErrorPresent(true)
            return false
        } else if (payload.newValue.toString().length == 0) {
            dispatch(onFieldsValueChangeHandler(payload))
            onFieldErrorChange(payload.fieldName, true, `Response empty`)
            setErrorPresent(true)
            return false
        } else {
            const errorPayload = {
                tabNo: value,
                fieldName: payload.fieldName,
                newValue: false,
                errorMessage: ``,
            }
            setErrorPresent(false)
            dispatch(onFieldsErrorChangeHandler(errorPayload))
            return true
        }
    }

    const onFieldValueChangeCheck = (payload) => {
        const fieldsForTab = getFieldsArrayForTab()
        const fieldObj = fieldsForTab.find((fieldObj) => fieldObj.text === payload.fieldName)

        fieldsForTab.map((fieldObj) => {
            if (fieldObj.calculated.value) {
                const derivedValue = calculateDerivedField(fieldObj.calculated.derivedFrom)
                dispatch(onFieldsValueChangeHandler({ tabNo: value, fieldName: fieldObj.text, newValue: derivedValue }))
            }
        })

        return decimalPlaceCheck(payload, fieldObj)
    }

    const onFieldValueChange = (e, fieldName) => {
        const newValue = e.target.value
        const payload = {
            tabNo: value,
            fieldName: fieldName,
            newValue: newValue,
        }
        onFieldValueChangeCheck(payload) ? dispatch(onFieldsValueChangeHandler(payload)) : null
    }

    const onDateNoteValueChange = (e, fieldName) => {
        const newValue = e.target.value
        const payload = {
            tabNo: value,
            fieldName: fieldName,
            newValue: newValue,
        }
        switch (fieldName) {
            case "Date": {
                checkDate(payload)
            }
            case "Notes": {
                dispatch(onFieldsValueChangeHandler(payload))
            }
        }
    }

    const checkDate = (payload) => {
        const date = new Date()
        const [day, month, year] = date.toLocaleDateString("en-GB").split("/")
        const transformedDate = `${year}-${month}-${day}`
        if (payload.newValue > transformedDate) {
            onFieldErrorChange("Date", true, "Date cannot be in the future")
            setErrorPresent(true)
            return false
        }
        onFieldErrorChange("Date", false, "")
        setErrorPresent(false)
        dispatch(onFieldsValueChangeHandler(payload))
        return true
    }

    const onFieldErrorChange = (fieldName, newValue, errorMessage) => {
        const payload = {
            tabNo: value,
            fieldName: fieldName,
            newValue: newValue,
            errorMessage: errorMessage,
        }
        dispatch(onFieldsErrorChangeHandler(payload))
    }

    const anyErrorsActive = () => {
        var returnVal = false
        getFieldsArrayForTab().map((fieldObj) => {
            if (fieldsValue[value][fieldObj.text].error) {
                returnVal = true
            }
        })
        return returnVal
    }

    const anyEmptyResponses = () => {
        var returnVal = false
        getFieldsArrayForTab().map((fieldObj) => {
            if (!fieldsValue[value][fieldObj.text].value) {
                setErrorPresent(true)
                onFieldErrorChange(fieldObj.text, true, `Response empty`)
                returnVal = true
            }
        })
        return returnVal
    }

    const onClickSaveButton = async () => {
        if (anyErrorsActive()) {
            dispatch(setOpen(true))
            return
        }
        if (anyEmptyResponses()) {
            dispatch(setOpen(true))
            return
        }

        const observationsToSave = []
        getFieldsArrayForTab().map((fieldObj) => {
            const observationResource = {
                resourceType: "Observation",
                status: "final",
                code: fieldObj.code,
                effectiveDateTime: fieldsValue[value]["Date"].value,
                valueQuantity: {
                    value: fieldsValue[value][fieldObj.text].value,
                    unit: fieldObj.unit,
                },
                comment: fieldsValue[value]["Notes"].value,
            }
            observationsToSave.push(observationResource)
        })

        observationsToSave.map((observationResource) => {
            saveObservations(observationResource)
        })
        getObservations()
        dispatch(setOpen(true))
    }

    const calculateDerivedField = (derivedString) => {
        return (fieldsValue[value]["Weight"].value / (fieldsValue[value]["Height"].value / 100) ** 2).toFixed(2)
    }

    return (
        <div>
            <FormControl margin="normal">
                {fieldsArray.length > 0
                    ? getFieldsArrayForTab().map((fieldObj) =>
                          fieldObj.display ? (
                              <Grid container direction="row" justify="flex-start" alignItems="center" spacing={3}>
                                  <Grid item>
                                      <TextField
                                          color="primary"
                                          label={fieldsValue[value][fieldObj.text].error ? fieldObj.text : null}
                                          variant="outlined"
                                          value={fieldsValue[value][fieldObj.text].value}
                                          onChange={(e) => onFieldValueChange(e, fieldObj.text)}
                                          helperText={
                                              fieldsValue[value][fieldObj.text].error
                                                  ? fieldsValue[value][fieldObj.text].errorMessage
                                                  : fieldObj.text
                                          }
                                          error={fieldsValue[value][fieldObj.text].error}
                                          type={fieldObj.type === "Quantity" && "number"}
                                          InputProps={{
                                              endAdornment: (
                                                  <InputAdornment position="end">{fieldObj.unit}</InputAdornment>
                                              ),
                                          }}
                                      />
                                  </Grid>
                                  <Grid item>
                                      {prevResponses[value][fieldObj.text].values.length > 0 ? (
                                          <Typography>
                                              Last updated on:&nbsp;
                                              {
                                                  prevResponses[value][fieldObj.text].values[
                                                      prevResponses[value][fieldObj.text].values.length - 1
                                                  ].date
                                              }
                                          </Typography>
                                      ) : null}
                                  </Grid>
                              </Grid>
                          ) : null
                      )
                    : null}

                {fieldsArray.length > 0 ? (
                    <TextField
                        id="date"
                        type="date"
                        variant="outlined"
                        onChange={(e) => onDateNoteValueChange(e, "Date")}
                        error={fieldsValue[value]["Date"].error}
                        helperText={fieldsValue[value]["Date"].error ? fieldsValue[value]["Date"].errorMessage : "Date"}
                        // defaultValue={fieldsValue.length > 0 && getDateNow()}
                        value={fieldsArray.length > 0 && fieldsValue[value]["Date"].value}
                        InputLabelProps={{
                            shrink: false,
                        }}
                    />
                ) : null}
            </FormControl>
            <Grid container directino="row" justify="flex-start" alignItems="center" spacing={3}>
                <Grid item xs={10}>
                    <FormControl fullWidth>
                        <TextField
                            fullWidth
                            helperText="Notes"
                            variant="outlined"
                            onChange={(e) => onDateNoteValueChange(e, "Notes")}
                            value={fieldsArray.length > 0 && fieldsValue[value]["Notes"].value}
                            multiline
                            rowsMax={3}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => onClickSaveButton()}
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>
                </Grid>
            </Grid>
            <ObservationDialog
                title={errorPresent ? "Error" : "Saved entries"}
                contentText={errorPresent ? "Fix all the errors before saving entries" : ""}
                buttonName={errorPresent ? "Understood" : "OK"}
            />
        </div>
    )
}
