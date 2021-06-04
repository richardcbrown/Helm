import { FormControl, Grid, TextField, Typography } from "@material-ui/core"
import React from "react"

import { useSelector } from "react-redux"
import { selectQuestions, selectQuestionResponseItems } from "../QuestionnaireSlice"
import ConfirmationDialog from "../confirmationDialog/ConfirmationDialog"

export default function QuestionSubmitted(props) {
    const questions = useSelector(selectQuestions)
    const questionResponseItems = useSelector(selectQuestionResponseItems)

    const getAnswer = (linkId) => {
        var responseEntered = ""
        questionResponseItems.map((item, index) => {
            if (item.linkId === linkId) {
                responseEntered = questionResponseItems[index].answer[0].valueString
            }
        })
        return responseEntered
    }

    return (
        <div>
            <Grid container direction="column" justify="center" alignItems="stretch" spacing={3}>
                <Grid item>
                    <FormControl fullWidth>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                    </FormControl>
                </Grid>
                {questions.map((question, index) => (
                    <Grid item>
                        <FormControl fullWidth>
                            <Typography>{question.prefix}</Typography>
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
            <ConfirmationDialog />
        </div>
    )
}
