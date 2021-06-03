import { Grid, Typography, CircularProgress, Paper } from "@material-ui/core"
import React, { useEffect } from "react"

import { useStyles } from "./Styles"

import { useSelector, useDispatch } from "react-redux"
import Question from "./question/Question"
import QuestionSubmitted from "./questionSubmitted/QuestionSubmitted"
import VerticalLinearStepper from "./stepper/VerticalLinearStepper"
import { selectActiveStep } from "./stepper/VerticalLinearStepperSlice"
import { selectQuestions, updateQuestions, updateId } from "./QuestionnaireSlice"
import { updatePreviousAnswers } from "./pastAnswers/PastAnswersSlice"

export default function Questionnaire(props) {
    const classes = useStyles()
    const activeStep = useSelector(selectActiveStep)
    const questionList = useSelector(selectQuestions)
    const dispatch = useDispatch()

    const { resources } = props
    const questionnaireList = resources.Questionnaire
    const questionnaireResponse = resources.QuestionnaireResponse

    const obtainQuestionObjects = (questionnaireList) => {
        var questionsArray = []
        var id = ""
        questionnaireList
            ? questionnaireList.map((questionnaire, index) => {
                  questionsArray = questionnaire.item
                  id = questionnaire.id
              })
            : null
        dispatch(updateQuestions(questionsArray))
        dispatch(updateId(id))
    }

    useEffect(() => {
        obtainQuestionObjects(questionnaireList)
    }, [questionnaireList])

    useEffect(() => {
        questionnaireResponse ? dispatch(updatePreviousAnswers(questionnaireResponse)) : null
    }, [questionnaireResponse])

    // only need the answers to this questionnaire
    const requestResources = () => {
        props.requestResources("QuestionnaireResponse", "questionnaire=Questionnaire/$[Questionnaire[0].id]$", {
            Questionnaire: questionnaireList,
        })
    }

    return questionList.length === 0 ? (
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
    ) : (
        <div>
            <div className={classes.sectionDesktop}>
                <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={1}>
                    <Grid item xs={1}>
                        {activeStep === questionList.length ? null : (
                            <Typography variant="h5" align="right">
                                {activeStep + 1} -
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={6}>
                        {activeStep === questionList.length ? (
                            <QuestionSubmitted submit={props.submit} />
                        ) : (
                            <Question submit={props.submit} requestResources={requestResources} />
                        )}
                    </Grid>
                    <Grid item xs={5}>
                        <VerticalLinearStepper submit={props.submit} />
                    </Grid>
                </Grid>
            </div>
            <div className={classes.sectionMobile}>
                <Grid container direction="column" justify="center" alignItems="center" spacing={3}>
                    <Grid item xs={10}>
                        {activeStep === questionList.length ? (
                            <QuestionSubmitted submit={props.submit} />
                        ) : (
                            <Question submit={props.submit} requestResources={requestResources} />
                        )}
                    </Grid>
                    <Grid item xs={10}>
                        <VerticalLinearStepper submit={props.submit} />
                    </Grid>
                </Grid>
            </div>
        </div>
    )
}
