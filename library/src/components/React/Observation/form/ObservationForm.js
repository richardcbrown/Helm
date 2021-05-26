import { FormControl, InputAdornment, Button, Grid, TextField, Typography, IconButton } from '@material-ui/core';
import React, { useEffect } from 'react';
import SaveIcon from '@material-ui/icons/Save';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectObservations
} from '../ObservationSlice';
import {
    selectValue,
    selectTabTitles
} from '../tabs/ObservationTabsSlice';
import {
    selectFieldsArray,
    populateFieldsArray
} from './ObservationFormSlice';

export default function ObservationForm(props) {
    const observations = useSelector(selectObservations);
    const value = useSelector(selectValue);
    const tabTitles = useSelector(selectTabTitles);
    const fieldsArray = useSelector(selectFieldsArray);
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(populateFieldsArray(observations))
    }, [observations])

    const getDateNow = () => {
        const date = new Date()
        const [day, month, year] = date.toLocaleDateString("en-GB").split("/")
        const transformedDate = `${year}-${month}-${day}`
        console.log(transformedDate)
        return transformedDate;
    }

    return (
        <div>
            <FormControl margin="dense">
                {fieldsArray.length > 0 ?
                    fieldsArray[value][tabTitles[value]].map((fieldObj) => (
                        fieldObj.display ?
                            <TextField
                                color="primary"
                                helperText={fieldObj.text}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{fieldObj.unit}</InputAdornment>,
                                }} />
                            : null
                    ))
                    : null}
                <TextField
                    color="primary"
                    helperText="Weight"
                    variant="outlined"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                    }} />
                <TextField
                    color="primary"
                    helperText="Height"
                    variant="outlined"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }} />
                <TextField
                    id="date"
                    helperText="Date"
                    type="date"
                    variant="outlined"
                    defaultValue={getDateNow()}
                    InputLabelProps={{
                        shrink: false,
                    }} />

            </FormControl>
            <Grid
                container
                directino="row"
                justify="flex-start"
                alignItems="stretch"
                spacing={3}>
                <Grid item xs={10}>
                    <FormControl fullWidth>
                        <TextField
                            fullWidth
                            helperText="Notes"
                            variant="outlined"
                            multiline
                            rowsMax={3} />
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}