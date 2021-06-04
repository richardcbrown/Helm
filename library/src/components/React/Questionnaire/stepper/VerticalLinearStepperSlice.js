import { createSlice } from "@reduxjs/toolkit"

const VerticalLinearStepperSlice = createSlice({
    name: "verticalLinearStepper",
    initialState: {
        activeStep: 0,
    },
    reducers: {
        handleNext: (state) => {
            state.activeStep = state.activeStep + 1
        },
        handleBack: (state) => {
            state.activeStep > 0 ? (state.activeStep = state.activeStep - 1) : null
        },
        handleReset: (state) => {
            state.activeStep === 0 ? null : (state.activeStep = 0)
        },
        changeToQuestion: (state, action) => {
            const questionNo = Number(action.payload)
            state.activeStep = questionNo
        },
    },
})

export const selectActiveStep = (state) => state.verticalLinearStepper.activeStep

export const { handleNext, handleBack, handleReset, changeToQuestion } = VerticalLinearStepperSlice.actions

export default VerticalLinearStepperSlice.reducer
