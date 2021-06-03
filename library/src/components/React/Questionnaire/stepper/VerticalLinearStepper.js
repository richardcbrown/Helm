import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { FormControl, Grid, MobileStepper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { useSelector, useDispatch } from 'react-redux';
import {
  selectEdit,
  selectQuestionResponse,
  setDate,
  selectDate,
  setQuestionResponse
} from '../question/QuestionSlice';
import {
  selectActiveStep,
  handleNext,
  handleBack,
  handleReset,
  changeToQuestion
} from './VerticalLinearStepperSlice';
import {
  selectQuestions,
  selectQuestionnaireResponse,
  selectQuestionResponseItems,
  obtainAnsweredQuestions,
  updateQuestionResponses,
} from '../QuestionnaireSlice';
import {
  selectGroupedPrevAnswers,
  selectPreviousAnswers
} from '../pastAnswers/PastAnswersSlice';

import {
  setOpen
} from '../confirmationDialog/ConfirmationDialogSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  question: {
    cursor: "pointer",
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));


export default function VerticalLinearStepper(props) {

  const classes = useStyles();
  const activeStep = useSelector(selectActiveStep);
  const edit = useSelector(selectEdit);
  const date = useSelector(selectDate);
  const questionnaireResponse = useSelector(selectQuestionnaireResponse);
  const questionsObjects = useSelector(selectQuestions);
  const questionResponse = useSelector(selectQuestionResponse);
  const questionResponseItems = useSelector(selectQuestionResponseItems);
  const prevAnswers = useSelector(selectPreviousAnswers);
  const groupedPrevAnswers = useSelector(selectGroupedPrevAnswers);
  const dispatch = useDispatch()
  const steps = useSelector(selectQuestions)


  useEffect(() => {
    obtainPrevResponse(0)
    // dispatch(handleReset())
  }, [groupedPrevAnswers])

  useEffect(() => {
    onUpdateAnswer()
    dispatch(obtainAnsweredQuestions())
  }, [edit])


  const onSubmitHandler = async () => {
    dispatch(obtainAnsweredQuestions())
    const changedResources = {
      changedResource: questionnaireResponse,
      changeOperation: "POST",
    }
    await props.submit(changedResources)
    dispatch(setOpen(true))
  }

  const onUpdateAnswer = () => {
    if (activeStep <= questionsObjects.length - 1) {
      const item = {
        "linkId": questionsObjects[activeStep].linkId,
        "text": questionsObjects[activeStep].prefix,
        "answer": [{ "valueString": questionResponse, "valueDateTime": date }]
      }
      dispatch(updateQuestionResponses(item))
    }
  }

  const obtainCurrentResponse = (step) => {
    if (questionsObjects.length > 0) {
      const foundQuestionObj = questionResponseItems.find((item) => item.linkId == questionsObjects[step].linkId)
      if (foundQuestionObj) {
        dispatch(setQuestionResponse(foundQuestionObj.answer[0].valueString))
        dispatch(setDate(foundQuestionObj.answer[0].valueDateTime))
      }
      else { dispatch(setQuestionResponse("")) && dispatch(setDate("")) }
    }
  }

  const obtainPrevResponse = (step) => {
    if (questionsObjects.length > 0 && groupedPrevAnswers[activeStep]) {
      const foundPrevObj = groupedPrevAnswers[activeStep][0]
      if (foundPrevObj) {
        dispatch(setQuestionResponse(foundPrevObj.valueString))
        dispatch(setDate(foundPrevObj.valueDateTime))
      } else {
        obtainCurrentResponse(step)
      }
    }
  }

  return (
    < div >
      <div className={classes.root}>
        <div className={classes.sectionDesktop}>
          <FormControl>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label.prefix}>
                  <StepLabel
                    className={classes.question}
                    onClick={() => {
                      activeStep > index ?
                        dispatch(changeToQuestion(index)) &&
                        obtainPrevResponse(0, activeStep) : null
                    }}>
                    <Typography gutterBottom={true}><u><b>{label.prefix}</b></u></Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {
              activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                  {/* <Typography>All steps completed - you&apos;re finished</Typography> */}
                  <Button onClick={() => {
                    obtainPrevResponse(0, 0)
                    dispatch(handleReset())
                  }} className={classes.button}>
                    Reset
             </Button>
                  <Button onClick={() => onSubmitHandler()} color="primary" variant="contained" className={classes.button}>
                    Submit
              </Button>
                </Paper>
              )
            }
          </FormControl>
        </div>
      </div>
      <div className={classes.sectionMobile}>
        {activeStep == steps.length ?
          <FormControl fullWidth margin="dense">
            < Grid
              container
              direction="row"
              justify="space-between"
              align-items="flex-start"
              spacing={10} >
              <Grid item xs={6}>
                <Button size="small" onClick={() => {
                  obtainPrevResponse(0, 0)
                  dispatch(handleReset())
                }
                } >
                  Reset
               </Button>
              </Grid>
              <Grid item xs={6}>
                <Button size="small" onClick={() => onSubmitHandler()} color="primary" variant="contained">
                  Submit
               </Button>
              </Grid>
            </Grid>
          </FormControl>
          :
          <MobileStepper
            steps={steps.length}
            position="static"
            variant="text"
            activeStep={activeStep}
          />
        }
      </div>

    </div >
  );
}
