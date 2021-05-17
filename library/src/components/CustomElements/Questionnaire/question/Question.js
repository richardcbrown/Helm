import { FormControl, Grid, Typography, TextField, Button, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import React from 'react';
import EditIcon from '@material-ui/icons/Edit';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import DoneIcon from '@material-ui/icons/Done';

import { useStyles } from '../Styles';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectActiveStep,
    selectQuestionList,
    selectQuestionHelpList,
    handleNext,
    handleBack
} from '../stepper/VerticalLinearStepperSlice';
import {
    selectQuestionAPIRes,
    selectEdit,
    setEdit
} from './QuestionSlice';
import PastQuestion from '../pastQuestions/PastQuestions';

export default function Question({ questionnaire }) {
    const classes = useStyles();
    const activeStep = useSelector(selectActiveStep);
    const questions = useSelector(selectQuestionList);
    const edit = useSelector(selectEdit);
    const questionHelpList = useSelector(selectQuestionHelpList);
    const questionResponse = useSelector(selectQuestionAPIRes);

    const getQuestionnaire = () => {
        fetch(url, method="POST", body={})
    }

    const dispatch = useDispatch();
    return (

        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}>
            <Grid item>
                <Typography variant="h5">
                    {questions[activeStep]}
                </Typography>
            </Grid>
            <Grid item>
                <FormControl fullWidth >
                    <p>
                        {questionHelpList[activeStep]}
                    </p>
                    <TextField
                        id="outlined-multiline-static"
                        // label="Multiline"
                        multiline
                        rows={4}
                        defaultValue="Returned previous answer"
                        variant="outlined"
                        disabled={!edit}
                    />

                </FormControl>
            </Grid>
            <Grid item>
                <div className={classes.buttonRight}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => dispatch(setEdit(!edit))}
                        className={classes.button}
                    >
                        {edit ?
                            <div><DoneIcon />Done</div>
                            :
                            <div>
                                <EditIcon />
                                Edit
                        </div>}
                    </Button>
                </div>
            </Grid>

            <Grid item>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content">
                        <Typography>
                            <u><b>Previous answers ({questionResponse.length})</b></u>
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <PastQuestion />
                    </AccordionDetails>
                </Accordion>
            </Grid>

            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="flex-end">
                    <Grid item>
                        {activeStep > 0 ?
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => dispatch(handleBack())}
                                className={classes.button}
                            >
                                <ArrowBackIosIcon />
                            BACK
                            </Button>
                            : null}
                    </Grid>
                    <Grid item>
                        {/* Ensuring button does not show after all questions answered */}
                        <div className={classes.buttonRight}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => dispatch(handleNext())}
                                className={classes.button}
                            >
                                {activeStep === questions.length - 1 ? 'Finish' : 'Next'}
                                <NavigateNextIcon />
                            </Button>
                        </div>
                    </Grid>
                </Grid>
            </Grid>


        </Grid >
    )
}