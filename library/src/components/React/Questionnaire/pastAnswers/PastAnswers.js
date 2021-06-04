import { TextField, Grid, FormControl, Button, MobileStepper } from "@material-ui/core"
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons"
import { useTheme } from "@material-ui/core/styles"
import React, { useEffect } from "react"

import { useSelector, useDispatch } from "react-redux"

import { selectActiveStep } from "../stepper/VerticalLinearStepperSlice"
import {
    selectMaxPrevAnswers,
    selectPreviousAnswers,
    selectPageNo,
    nextPage,
    prevPage,
    selectGroupedPrevAnswers,
    resetPageNo,
} from "./PastAnswersSlice"
import { selectQuestions } from "../QuestionnaireSlice"

export default function PastAnswers(props) {
    const activeStep = useSelector(selectActiveStep)
    const maxPrevAnswers = useSelector(selectMaxPrevAnswers)
    const pageNo = useSelector(selectPageNo)
    const groupedPrevAnswers = useSelector(selectGroupedPrevAnswers)
    var totalPages = groupedPrevAnswers[activeStep]
        ? Math.ceil(groupedPrevAnswers[activeStep].length / maxPrevAnswers)
        : 0
    const theme = useTheme()
    const dispatch = useDispatch()

    const { requestResources } = props

    useEffect(() => {
        const extractPrevAnswers = () => {
            requestResources()
        }
        extractPrevAnswers()
        totalPages = groupedPrevAnswers[activeStep]
            ? Math.ceil(groupedPrevAnswers[activeStep].length / maxPrevAnswers)
            : 0
        dispatch(resetPageNo())
    }, [activeStep])

    const obtainFormattedDate = (item) => {
        let date = new Date(item)
        return `Submitted on: ${date.toLocaleTimeString("en-GB")} ${date.toDateString()} `
    }

    return (
        <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={2}>
            {groupedPrevAnswers[activeStep] &&
                groupedPrevAnswers[activeStep].map(
                    (item, index) =>
                        index < maxPrevAnswers * (pageNo + 1) &&
                        index >= maxPrevAnswers * pageNo && (
                            <Grid item>
                                <FormControl fullWidth>
                                    <TextField
                                        multiline
                                        rows={3}
                                        value={item.valueString}
                                        variant="outlined"
                                        disabled
                                        helperText={obtainFormattedDate(item.valueDateTime)}
                                    />
                                </FormControl>
                            </Grid>
                        )
                )}
            <Grid item>
                <MobileStepper
                    variant="dots"
                    steps={totalPages}
                    position="static"
                    activeStep={pageNo}
                    nextButton={
                        <Button
                            size="small"
                            onClick={() => dispatch(nextPage())}
                            disabled={pageNo === totalPages - 1 || totalPages === 0}
                        >
                            Next
                            {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={() => dispatch(prevPage())} disabled={pageNo === 0}>
                            {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                            Back
                        </Button>
                    }
                />
            </Grid>
        </Grid>
    )
}
