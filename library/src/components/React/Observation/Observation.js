import { Grid } from '@material-ui/core';
import React, { useEffect } from 'react';
import ObservationTabs from './tabs/ObservationTabs';
import Content from './content/Content';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectValue
} from './tabs/ObservationTabsSlice';
import { setObservations } from './ObservationSlice';

export default function Observation(props) {
    const {
        configuration,
        observations,
        saveObservations,
        getObservations
    } = props

    const value = useSelector(selectValue);
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setObservations(configuration.observations))
    }, [configuration])

    return (

        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={3}>
            <Grid item >
                <ObservationTabs configuration={configuration} />
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-evenly"
                    alignItems="stretch"
                    spacing={3}>
                    <Grid item xs={12}>
                        <Content />
                    </Grid>
                </Grid>
            </Grid>
        </Grid >
    )
}