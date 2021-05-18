import { Grid, Typography } from '@material-ui/core';
import React from 'react';

import { useSelector } from 'react-redux'
import Question from './question/Question';
import VerticalLinearStepper from './stepper/VerticalLinearStepper';
import {
    selectActiveStep
} from './stepper/VerticalLinearStepperSlice';

export default function Questionnaire() {
    const activeStep = useSelector(selectActiveStep);
    return (
        <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={3}>
            <Grid item xs={1}>
                <Typography variant="h5" align="right">
                    {activeStep}-
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Question />
            </Grid>
            <Grid item xs={5}>
                <VerticalLinearStepper />
            </Grid>
        </Grid >

    )
}