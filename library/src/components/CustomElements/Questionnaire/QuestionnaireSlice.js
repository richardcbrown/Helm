import { createSlice } from '@reduxjs/toolkit';

const questionnaireSlice = createSlice({
    name: "questionnaire",
    initialState: {
        questions: [],
        questionnaireResponse: {},
        questionResponseItems: [],
        questionnaireId: ""
    },
    reducers: {
        updateQuestions: (state, action) => {
            const newArray = Array(action.payload)
            state.questions = (action.payload)
        },
        /**
         * 
         * @param {*} state 
         * @param {Object} actions e.g.{linkId: "item1", answer:[{valueString:"Answer to question 1"}]}
         */
        updateQuestionResponses: (state, actions) => {
            const questionResponse = Object(actions.payload)
            console.log("updateQuestionResponses: ", questionResponse)
            var count = 0;
            state.questionResponseItems.map((item, index) => {
                if (item.linkId === questionResponse.linkId) {
                    state.questionResponseItems[index] = questionResponse
                    count += 1;
                }
            })
            if (count === 0) {
                state.questionResponseItems.push(questionResponse)
            }

        },
        obtainAnsweredQuestions: (state) => {
            const finalObject = {
                "resourceType": "QuestionnaireResponse",
                "authored": new Date().toISOString(),
                "item": state.questionResponseItems,
                "questionnaire": { "reference": `Questionnaire/${state.questionnaireId}` },
                "status": "completed"
            }
            state.questionnaireResponse = finalObject;
        },
        updateId: (state, action) => {
            const id = String(action.payload)
            state.questionnaireId = id;
        }
    }
})

export const selectQuestions = (state) => state.questionnaire.questions;
export const selectQuestionResponseItems = (state) => state.questionnaire.questionResponseItems;
export const selectQuestionnaireResponse = (state) => state.questionnaire.questionnaireResponse;
export const selectId = (state) => state.questionnaire.questionnaireId;

export const { updateQuestions, updateQuestionResponses, obtainAnsweredQuestions, updateId } = questionnaireSlice.actions;

export default questionnaireSlice.reducer;