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
  selectQuestionList,
  handleNext,
  handleBack,
  handleReset,
  changeToQuestion
} from './VerticalLinearStepperSlice';

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


export default function VerticalLinearStepper() {
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return `Please enter ODS code. Service will pull data from the
                official database that matches the ODS code`;
      case 1:
        return 'Confirm details of your organisation are correct';
      // case 2:
      //   return `Try out different ad text to see what brings in the most customers,
      //           and learn how to enhance your ads using features like ad extensions.
      //           If you run into any problems with your ads, find out how to tell if
      //           they're running and how to resolve approval issues.`;
      default:
        return 'Unknown step';
    }
  }

  const classes = useStyles();
  const activeStep = useSelector(selectActiveStep);
  const dispatch = useDispatch()
  const steps = useSelector(selectQuestionList)

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel className={classes.question} onClick={() => dispatch(changeToQuestion(index))}>
              <Typography gutterBottom={true}><u><b>{label}</b></u></Typography>
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
        </Paper>
      )}
    </div>
  );
}
