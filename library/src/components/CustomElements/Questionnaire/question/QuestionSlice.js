import { createSlice } from '@reduxjs/toolkit';

const questionSlice = createSlice({
    name: "question",
    initialState: {
        questionAPIRes: [{
            date: "03-Nov-2020",
            answer: "prev answer 1"
        }, {
            date: "11-Jan-2020",
            answer: "prev answer 2"
        }],
        questionResponse: "",
        edit: false,
        questionnaireResponse: {}
    },
    reducers: {
        getResponse: (state, action) => {
            const questionNo = Number(action.payload)
            // Carry out API call to obtain response for question 
        },
        setEdit: (state, action) => {
            const bool = Boolean(action.payload)
            state.edit = bool;
        },
        setQuestionResponse: (state, action) => {
            const text = String(action.payload);
            state.questionResponse = text;
        },

    }
})

export const selectQuestionAPIRes = (state) => state.question.questionAPIRes;
export const selectQuestionResponse = (state) => state.question.questionResponse;
export const selectEdit = (state) => state.question.edit;

export const { setEdit, setQuestionResponse } = questionSlice.actions;

export default questionSlice.reducer;