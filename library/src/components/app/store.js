import { configureStore } from '@reduxjs/toolkit';
import verticalLinearStepperReducer from '../CustomElements/Questionnaire/stepper/VerticalLinearStepperSlice';
import questionReducer from '../CustomElements/Questionnaire/question/QuestionSlice';
import questionnnaireReducer from '../CustomElements/Questionnaire/QuestionnaireSlice';

export const store = configureStore({
    reducer: {
        verticalLinearStepper: verticalLinearStepperReducer,
        question: questionReducer,
        questionnaire: questionnnaireReducer
    },
});
