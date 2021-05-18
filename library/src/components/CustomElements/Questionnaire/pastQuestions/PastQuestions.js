import { TextField, Grid, Typography, FormControl } from '@material-ui/core';
import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectQuestionAPIRes
} from '../question/QuestionSlice';

export default function PastQuestion() {
    const questionResponse = useSelector(selectQuestionAPIRes);
    return (
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}>
            { questionResponse.map((item, index) => (
                <Grid item>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="flex-start"
                        spacing={4}>
                        <Grid item xs={3}>
                            <Typography align="right">
                                {item.date}
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <FormControl fullWidth>
                                <TextField
                                    multiline
                                    rows={3}
                                    defaultValue={item.answer}
                                    variant="outlined"
                                    disabled
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            ))
            }
        </Grid>
    )
}