import { Grid } from '@material-ui/core';
import React from 'react';
import ObservationTabs from './tabs/ObservationTabs';
import DatePicker from './datePicker/DatePicker';

import { useSelector } from 'react-redux';
import {
    selectValue
} from './tabs/ObservationTabsSlice';

export default function Observation(props) {
    const {
        configuration,
        observations,
        saveObservations,
        getObservations
    } = props

    const value = useSelector(selectValue);

    const objVal = {
        0: "height&weight",
        1: "blood pressure",
        2: "oxySat"
    }

    console.log(objVal[value])

    return (
        <Grid
            container
            direction="column"
            justify="space-around"
            alignItems="center"
            spacing={3}>
            <Grid item >
                <ObservationTabs />
            </Grid>
            <Grid item>
                {objVal[value]}
            </Grid>
        </Grid>
    )
}