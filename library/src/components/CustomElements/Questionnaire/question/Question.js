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
    handleNext,
    handleBack
} from '../stepper/VerticalLinearStepperSlice';
import {
    selectQuestionResponse,
    selectEdit,
    setEdit,
    setQuestionResponse
} from './QuestionSlice';
import {
    selectQuestions,
    selectQuestionnaireResponse,
    selectQuestionResponseItems,
    updateQuestionResponses,
    obtainAnsweredQuestions
} from '../QuestionnaireSlice';
import PastQuestion from '../pastQuestions/PastQuestions';

export default function Question(props) {
    const classes = useStyles();
    const activeStep = useSelector(selectActiveStep);
    const questionsObjects = useSelector(selectQuestions);
    const questionResponseItems = useSelector(selectQuestionResponseItems);
    const questionnnaireResponse = useSelector(selectQuestionnaireResponse);
    console.log(questionsObjects)
    const edit = useSelector(selectEdit);
    const questionResponse = useSelector(selectQuestionResponse);
    const dispatch = useDispatch();

    const { submit } = props;

    const onAnswerChangeHandler = (e) => {
        dispatch(setQuestionResponse(e.target.value))
    }

    const onUpdateAnswer = () => {
        const item = {
            "linkId": questionsObjects[activeStep].linkId,
            "answer": [{ "valueString": questionResponse }]
        }
        dispatch(updateQuestionResponses(item))
    }

    const onNextClickHandler = async () => {
        dispatch(setEdit(false))
        await dispatch(handleNext())
        onUpdateAnswer()
        activeStep + 1 < questionsObjects.length ? obtainCurrentResponse(+1) : null
    }

    const onBackClickHandler = async () => {
        dispatch(setEdit(false))
        await dispatch(handleBack())
        onUpdateAnswer()
        activeStep - 1 > questionsObjects.length ? obtainCurrentResponse(-1) : null
    }

    const obtainCurrentResponse = (step) => {
        var responseEntered = ""
        questionResponseItems.map((item, index) => {
            if (questionsObjects[activeStep + step].linkId) {
                if (item.linkId === questionsObjects[activeStep + step].linkId) {
                    responseEntered = questionResponseItems[index].answer[0].valueString;
                }
            }

        })
        dispatch(setQuestionResponse(responseEntered));
    }

    const onSubmitQuestionnaire = () => {
        onNextClickHandler();
        dispatch(obtainAnsweredQuestions())
        console.log(questionnnaireResponse)
    }


    return (

        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}>
            <Grid item>
                <Typography variant="h5">
                    {questionsObjects[activeStep].prefix}
                </Typography>
            </Grid>
            <Grid item>
                <FormControl fullWidth >
                    <p>
                        {questionsObjects[activeStep].text}
                    </p>
                    <TextField
                        id="outlined-multiline-static"
                        // label="Multiline"
                        multiline
                        rows={4}
                        defaultValue="prev answer 1"
                        value={questionResponse}
                        variant="outlined"
                        onChange={(e) => onAnswerChangeHandler(e)}
                        disabled={!edit}
                    />

                </FormControl>
            </Grid>
            <Grid item>
                <div className={classes.buttonRight}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            dispatch(setEdit(!edit))
                            onUpdateAnswer()
                        }}
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
                            <u><b>Previous answers ({2})</b></u>
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
                                onClick={() => onBackClickHandler()}
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
                                onClick={() => {
                                    activeStep === questionsObjects.length - 1
                                        ?
                                        onSubmitQuestionnaire()
                                        :
                                        onNextClickHandler()
                                }}
                                className={classes.button}
                            >
                                {activeStep === questionsObjects.length - 1 ? 'Finish' : 'Next'}
                                <NavigateNextIcon />
                            </Button>
                        </div>
                    </Grid>
                </Grid>
            </Grid>


        </Grid >
    )
}