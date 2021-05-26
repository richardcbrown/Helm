import { FormControl, Grid, Typography, TextField, Button, IconButton, Accordion, AccordionSummary, AccordionDetails, ListItemAvatar } from '@material-ui/core';
import React, { useEffect } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import DoneIcon from '@material-ui/icons/Done';

import PastAnswers from '../pastAnswers/PastAnswers';

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
    selectDate,
    setDate,
    selectDisplayDate,
    setQuestionResponse
} from './QuestionSlice';
import {
    selectQuestions,
    selectQuestionnaireResponse,
    selectQuestionResponseItems,
    updateQuestionResponses,
    obtainAnsweredQuestions
} from '../QuestionnaireSlice';
import {
    selectPreviousAnswers
} from '../pastAnswers/PastAnswersSlice';

import {
    getDate
} from '../Utils/Utils';


export default function Question(props) {
    const classes = useStyles();
    const activeStep = useSelector(selectActiveStep);
    const questionsObjects = useSelector(selectQuestions);
    const date = useSelector(selectDate);
    const displayDate = useSelector(selectDisplayDate);
    const questionResponseItems = useSelector(selectQuestionResponseItems);
    const prevAnswers = useSelector(selectPreviousAnswers);
    const questionnnaireResponse = useSelector(selectQuestionnaireResponse);
    const edit = useSelector(selectEdit);
    const questionResponse = useSelector(selectQuestionResponse);
    const dispatch = useDispatch();

    const { submit } = props;

    useEffect(() => {
        obtainCurrentResponse(0)
    }, [activeStep])

    const onUpdateAnswer = () => {
        if (activeStep <= questionsObjects.length - 1) {
            const item = {
                "linkId": questionsObjects[activeStep].linkId,
                "text": questionsObjects[activeStep].prefix,
                "answer": [{ "valueString": questionResponse, "valueDateTime": date === null ? new Date().toString() : date }]
            }
            dispatch(updateQuestionResponses(item))
        }
    }

    const onAnswerChangeHandler = (e) => {
        dispatch(setQuestionResponse(e.target.value))
    }

    const onNextClickHandler = async () => {
        edit ? dispatch(setEdit(false)) : null
        await dispatch(handleNext())
        onUpdateAnswer()
    }

    const onBackClickHandler = async () => {
        edit ? dispatch(setEdit(false)) : null
        await dispatch(handleBack())
        onUpdateAnswer()
    }

    const obtainCurrentResponse = (step) => {
        if (questionsObjects.length > 0) {
            const foundQuestionObj = questionResponseItems.find((item) => item.linkId == questionsObjects[activeStep + step].linkId)
            console.log(foundQuestionObj)
            if (foundQuestionObj) {
                dispatch(setQuestionResponse(foundQuestionObj.answer[0].valueString))
                dispatch(setDate(foundQuestionObj.answer[0].valueDateTime))
            }
            else {
                obtainPrevResponse(step)
            }

        }
    }



    const obtainPrevResponse = (step) => {
        if (questionsObjects.length > 0 && prevAnswers.length > 0) {
            const foundPrevObj = prevAnswers[0].answers.find((item) => item.linkId == questionsObjects[activeStep + step].linkId)
            console.log(foundPrevObj)
            if (foundPrevObj) {
                dispatch(setQuestionResponse(foundPrevObj.answer[0].valueString))
                dispatch(setDate(foundPrevObj.answer[0].valueDateTime))
            } else {
                dispatch(setQuestionResponse("")) && dispatch(setDate(""))
            }
        } else {
            dispatch(setQuestionResponse("")) && dispatch(setDate(""))
        }

    }

    const getLatestPrevAnswer = () => {
        var latestPrevAnswer = ""
        if (prevAnswers.length > 0) {
            prevAnswers[prevAnswers.length - 1].answers.map((item) => {
                item.linkId === questionsObjects[activeStep].linkId ?
                    latestPrevAnswer = item.answer[0].valueString : null
            })
        }
        return latestPrevAnswer
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
                    <Typography>
                        {questionsObjects[activeStep].text}
                    </Typography>
                    <TextField
                        id="outlined-multiline-static"
                        // label="Multiline"
                        multiline
                        rows={4}
                        // defaultValue={getLatestPrevAnswer()}
                        value={questionResponse}
                        variant="outlined"
                        helperText={displayDate}
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
                            dispatch(setDate(new Date().toString()))
                            // onUpdateAnswer().then(obtainCurrentResponse(0))
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
                            <u><b>Previous answers ({prevAnswers.length})</b></u>
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <PastAnswers requestResources={props.requestResources} />
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