import { createSlice } from '@reduxjs/toolkit';

const questionSlice = createSlice({
    name: "question",
    initialState: {
        questionResponse: "",
        edit: false,
        date: "",
        displayDate: ""
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
        setDate: (state, action) => {
            const date = action.payload ? new Date(String(action.payload)) : null
            state.date = date ? date.toString() : null
            state.displayDate = date ? `Last updated: ${date.toLocaleTimeString("en-GB")} ${date.toDateString()} ` : null
        }
    }
})

export const selectQuestionAPIRes = (state) => state.question.questionAPIRes;
export const selectQuestionResponse = (state) => state.question.questionResponse;
export const selectEdit = (state) => state.question.edit;
export const selectDate = (state) => state.question.date;
export const selectDisplayDate = (state) => state.question.displayDate;

export const { setEdit, setQuestionResponse, setDate } = questionSlice.actions;

export default questionSlice.reducer;