import { FormControl, Grid, TextField, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectQuestions,
    selectQuestionResponseItems,
    selectQuestionnaireResponse,
    obtainAnsweredQuestions
} from '../QuestionnaireSlice';

export default function QuestionSubmitted(props) {
    const questions = useSelector(selectQuestions);
    const questionResponseItems = useSelector(selectQuestionResponseItems);
    const questionnaireResponse = useSelector(selectQuestionnaireResponse);
    const dispatch = useDispatch();

    // useEffect(() => {
    //     dispatch(obtainAnsweredQuestions());
    // }, [questionnaireResponse]);

    const getAnswer = (linkId) => {
        var responseEntered = ""
        questionResponseItems.map((item, index) => {
            if (item.linkId === linkId) {
                responseEntered = questionResponseItems[index].answer[0].valueString;
            }
        })
        return responseEntered;
    }
    return (
        <div>


            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                spacing={3}>
                {console.log(questions)}
                {questions.map((question, index) => (
                    < Grid item >
                        <FormControl fullWidth>
                            <Typography>
                                {question.prefix}
                            </Typography>
                            <TextField
                                multiline
                                rows={4}
                                defaultValue="prev answer 1"
                                value={getAnswer(question.linkId)}
                                variant="outlined"
                                disabled
                            />
                        </FormControl>
                    </Grid>
                ))}


            </Grid>
        </div >
    )
}