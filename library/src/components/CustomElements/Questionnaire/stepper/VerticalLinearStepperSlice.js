import { createSlice } from '@reduxjs/toolkit';

const VerticalLinearStepperSlice = createSlice({
    name: "verticalLinearStepper",
    initialState: {
        activeStep: 0,
        questionList: [
            'What matters to me?',
            'Who are the most important people in my life?',
            'What do I do to keep myself well?',
            'Things to think about in the future'
        ],
        questionHelpList: [
            "Think about your core values, spiritual beliefs, culture, ethnicity and religion as they relate to your care. " +
            "Think about meaningful activities you enjoy, pets, objects, computer games, exercise sport, places you like to visit, " +
            "education or spending time with family and friends.",
            "Consider friends, family, staff in the care home and people who support you at home, in the community or at a club." +
            "  Also include how you stay connected to these people." +
            "Please do and please don't" +
            "\nPlease Do: Consider any preferences and what you want someone to do when caring for or supporting you." +
            "\nPlease Don’t: Consider the important things that you don’t want someone to do when caring for or supporting you." +
            "  This could include not asking questions about certain topics, making assumptions about something, and providing support when it is not wanted.",
            "Consider how you feel on a typical day through to how you feel on a day when you are unwell or very unwell. " +
            "\nConsider any conditions or symptoms that you live with, how they affect you and how you manage them.  This could" +
            " include, for example, long-term pain and how you currently manage it. " +
            "\nConsider anything that can help or hinder your wellness.  Include what causes" +
            " you to become unwell and how you avoid or address them.  Also Include any signs that may indicate that you are " +
            "becoming unwell and how do you manage them.",
            "Consider your goals and hopes. Include what drives you to keep well or to manage a condition.  " +
            "This could include being able to do the things that you enjoy, such as specific activities with your friends and family members."
        ],

    },
    reducers: {
        handleNext: (state) => {
            state.activeStep = state.activeStep + 1;
        },
        handleBack: (state) => {
            state.activeStep > 0 ? state.activeStep = state.activeStep - 1 : null
        },
        handleReset: (state) => {
            state.activeStep = 0;
        },
        changeToQuestion: (state, action) => {
            const questionNo = Number(action.payload)
            state.activeStep = questionNo
        }
    }
})

export const selectActiveStep = (state) => state.verticalLinearStepper.activeStep;
export const selectQuestionList = (state) => state.verticalLinearStepper.questionList;
export const selectQuestionHelpList = (state) => state.verticalLinearStepper.questionHelpList;


export const { handleNext, handleBack, handleReset, changeToQuestion } = VerticalLinearStepperSlice.actions;

export default VerticalLinearStepperSlice.reducer;