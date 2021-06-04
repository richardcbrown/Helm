import { configureStore } from "@reduxjs/toolkit"
import verticalLinearStepperReducer from "../React/Questionnaire/stepper/VerticalLinearStepperSlice"
import questionReducer from "../React/Questionnaire/question/QuestionSlice"
import questionnnaireReducer from "../React/Questionnaire/QuestionnaireSlice"
import pastAnswersReducer from "../React/Questionnaire/pastAnswers/PastAnswersSlice"
import confirmationDialogReducer from "../React/Questionnaire/confirmationDialog/ConfirmationDialogSlice"

export const store = configureStore({
    reducer: {
        verticalLinearStepper: verticalLinearStepperReducer,
        question: questionReducer,
        questionnaire: questionnnaireReducer,
        pastAnswers: pastAnswersReducer,
        confirmationDialog: confirmationDialogReducer,
    },
})
