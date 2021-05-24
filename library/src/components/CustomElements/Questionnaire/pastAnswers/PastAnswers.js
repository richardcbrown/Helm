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
    prevPage
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
    const totalPages = Math.ceil(prevAnswers.length / maxPrevAnswers)
    const theme = useTheme()
    const dispatch = useDispatch()

    const { requestResources } = props;


    useEffect(() => {
        const extractPrevAnswers = () => {
            requestResources("QuestionnaireResponse", "", {})
        }
        extractPrevAnswers()
    }, [activeStep])

    const obtainPrevAnswer = (item) => {
        console.log("item.answers[activeStep].answer[0].valueString: ", item.answers[activeStep].answer[0].valueString)

        return item.answers[activeStep].answer[0].valueString
    }

    const obtainFormattedDate = (item) => {
        let date = new Date(item.dateTime)
        return `Submitted on: ${date.toLocaleTimeString("en-GB")} ${date.toDateString()} `
    }
    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}>
            { prevAnswers.map((item, index) => (
                index < maxPrevAnswers * (pageNo + 1) && index >= maxPrevAnswers * pageNo &&
                < Grid item >
                    <FormControl fullWidth>
                        <TextField
                            multiline
                            rows={3}
                            value={obtainPrevAnswer(item)}
                            variant="outlined"
                            disabled
                            helperText={obtainFormattedDate(item)}
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