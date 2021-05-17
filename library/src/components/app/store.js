import { configureStore } from '@reduxjs/toolkit';
import verticalLinearStepperReducer from '../CustomElements/Questionnaire/stepper/VerticalLinearStepperSlice';
import questionReducer from '../CustomElements/Questionnaire/question/QuestionSlice';

export const store = configureStore({
    reducer: {
        verticalLinearStepper: verticalLinearStepperReducer,
        question: questionReducer
    },
});
