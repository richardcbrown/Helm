import { TextField, Grid, Typography, FormControl, Button, MobileStepper } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectQuestionAPIRes
} from '../question/QuestionSlice';
import { selectActiveStep } from '../stepper/VerticalLinearStepperSlice';
import {
    selectMaxPrevAnswers,
    selectPreviousAnswers,
    selectPageNo,
    updatePreviousAnswers,
    nextPage,
    prevPage,
    selectGroupedPrevAnswers,
    resetPageNo
} from './PastAnswersSlice';
import {
    selectQuestions
} from '../QuestionnaireSlice';


export default function PastAnswers(props) {
    const prevAnswers = useSelector(selectPreviousAnswers);
    const activeStep = useSelector(selectActiveStep);
    const questionObjects = useSelector(selectQuestions);
    const maxPrevAnswers = useSelector(selectMaxPrevAnswers);
    const pageNo = useSelector(selectPageNo);
    const groupedPrevAnswers = useSelector(selectGroupedPrevAnswers);
    var totalPages = groupedPrevAnswers[activeStep] ? Math.ceil(groupedPrevAnswers[activeStep].length / maxPrevAnswers) : 0
    const theme = useTheme()
    const dispatch = useDispatch()

    const { requestResources } = props;


    useEffect(() => {
        const extractPrevAnswers = () => {
            requestResources("QuestionnaireResponse", "", {})
        }
        extractPrevAnswers()
        totalPages = groupedPrevAnswers[activeStep] ? Math.ceil(groupedPrevAnswers[activeStep].length / maxPrevAnswers) : 0
        dispatch(resetPageNo())
    }, [activeStep])



    const obtainPrevAnswer = (item) => {
        console.log(item)
        // if (item.answers[activeStep]) {
        // if (item.answers[activeStep].linkId == activeStep[activeStep]) {
        return item.answers[activeStep].answer[0].valueString
        // }
        // }
    }

    const obtainFormattedDate = (item) => {
        let date = new Date(item)
        return `Submitted on: ${date.toLocaleTimeString("en-GB")} ${date.toDateString()} `
    }

    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}>
            { groupedPrevAnswers[activeStep] && groupedPrevAnswers[activeStep].map((item, index) => (

                index < maxPrevAnswers * (pageNo + 1) && index >= maxPrevAnswers * pageNo &&
                // console.log("item: ", item) &&

                < Grid item >
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
            ))
            }
            <Grid item>
                <MobileStepper
                    variant="dots"
                    steps={totalPages}
                    position="static"
                    activeStep={pageNo}
                    nextButton={
                        <Button size="small" onClick={() => dispatch(nextPage())} disabled={pageNo === totalPages - 1 || totalPages === 0}>
                            Next
                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={() => dispatch(prevPage())} disabled={pageNo === 0}>
                            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                    Back
                  </Button>
                    } />
            </Grid>
        </Grid >
    )
}