import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { useSelector, useDispatch } from 'react-redux';
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
  obtainAnsweredQuestions
} from '../QuestionnaireSlice';

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
  }
}));


export default function VerticalLinearStepper(props) {

  const classes = useStyles();
  const activeStep = useSelector(selectActiveStep);
  const questionnaireResponse = useSelector(selectQuestionnaireResponse);
  const dispatch = useDispatch()
  const steps = useSelector(selectQuestions)

  const onSubmitHandler = () => {
    dispatch(obtainAnsweredQuestions())
    const changedResources = {
      changedResource: questionnaireResponse,
      changeOperation: "POST",
    }
    props.submit(changedResources)
  }

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label.prefix}>
            <StepLabel className={classes.question} onClick={() => dispatch(changeToQuestion(index))}>
              <Typography gutterBottom={true}><u><b>{label.prefix}</b></u></Typography>
            </StepLabel>
            {/* <StepContent>
              <Typography>{getStepContent(index)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={() => dispatch(handleBack())}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => dispatch(handleNext())}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent> */}
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={() => dispatch(handleReset())} className={classes.button}>
            Reset
          </Button>
          <Button onClick={() => onSubmitHandler()} color="primary" variant="contained" className={classes.button}>
            Submit
          </Button>
        </Paper>
      )}
    </div>
  );
}
