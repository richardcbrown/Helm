import { createSlice } from '@reduxjs/toolkit';

const questionnaireSlice = createSlice({
    name: "questionnaire",
    initialState: {
        questions: []
    },
    reducers: {
        updateQuestions: (state, action) => {
            const newArray = Array(action.payload)
            state.questions = (action.payload)
        }
    }
})

export const selectQuestions = (state) => state.questionnaire.questions;

export const { updateQuestions } = questionnaireSlice.actions;

export default questionnaireSlice.reducer;