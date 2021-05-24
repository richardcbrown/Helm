import { configureStore } from '@reduxjs/toolkit';
import verticalLinearStepperReducer from '../CustomElements/Questionnaire/stepper/VerticalLinearStepperSlice';
import questionReducer from '../CustomElements/Questionnaire/question/QuestionSlice';
import questionnnaireReducer from '../CustomElements/Questionnaire/QuestionnaireSlice';
import pastAnswersReducer from '../CustomElements/Questionnaire/pastAnswers/PastAnswersSlice';
import confirmationDialogReducer from '../CustomElements/Questionnaire/confirmationDialog/ConfirmationDialogSlice';

export const store = configureStore({
    reducer: {
        verticalLinearStepper: verticalLinearStepperReducer,
        question: questionReducer,
        questionnaire: questionnnaireReducer,
        pastAnswers: pastAnswersReducer,
        confirmationDialog: confirmationDialogReducer
    },
});
