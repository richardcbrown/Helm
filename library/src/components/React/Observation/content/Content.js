import { Grid, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import ObservationForm from '../form/ObservationForm';
import ObeservationGraph from '../graph/ObservationGraph';
import Table from '../table/Table';

import { useSelector, useDispatch } from 'react-redux';
import {
    populateInformation,
    selectInformation
} from './ContentSlice';
import {
    selectValue
} from '../tabs/ObservationTabsSlice';
import {
    selectObservations
} from '../ObservationSlice';

export default function content(props) {
    const informationArray = useSelector(selectInformation)
    const value = useSelector(selectValue)
    const observations = useSelector(selectObservations)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(populateInformation(observations))
    }, [observations])

    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}>
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-evenly"
                    alignItems="stretch"
                    spacing={3}>
                    <Grid item xs={5}>
                        <ObservationForm />
                    </Grid>
                    <Grid item xs={5}>
                        <Typography variant="h4">
                            {informationArray.length > 0 ? informationArray[value].header : null}
                        </Typography>
                        <Typography variant="subtitle1">
                            {informationArray.length > 0 ? informationArray[value].body : null}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-evenly"
                    alignItems="stretch"
                    spacing={3}>
                    <Grid item xs={5}>
                        <Table />
                    </Grid>
                    <Grid item xs={5}>
                        <ObeservationGraph />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-evenly"
                    alignItems="stretch"
                    spacing={3}>
                    <Grid item xs={10}>
                        {informationArray.length > 0 ? informationArray[value].footer : null}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}