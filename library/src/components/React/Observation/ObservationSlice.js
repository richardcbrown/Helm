import { createSlice } from '@reduxjs/toolkit';

const ObservationSlice = createSlice({
    name: "observation",
    initialState: {
        observations: [],
        prevResponses: {
            weight: [{
                value: "",
                dateTime: ""
            }],
            height: [{
                value: "",
                dateTime: ""
            }],
            pulse: [{
                value: "",
                dateTime: ""
            }],
            oxySat: [{
                value: "",
                dateTime: ""
            }],
            systolicPressure: [{
                value: "",
                dateTime: ""
            }],
            diastolicPressure: [{
                value: "",
                dateTime: ""
            }],
            peakFlow: [{
                value: "",
                dateTime: ""
            }]
        }
    },
    reducers: {
        setObservations: (state, action) => {
            const observations = action.payload
            state.observations = observations;
        },
        setPrevResponses: (state, action) => {
        }
    }
})

export const selectObservations = (state) => state.observation.observations;
export const selectPrevResponses = (state) => state.observation.prevResponse;

export const { setObservations } = ObservationSlice.actions;

export default ObservationSlice.reducer;