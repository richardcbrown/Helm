import { createSlice } from '@reduxjs/toolkit';

const ObservationSlice = createSlice({
    name: "observation",
    initialState: {
        observations: [],
        prevResponses: []
    },
    reducers: {
        setObservations: (state, action) => {
            const observations = action.payload
            state.observations = observations;
        },
        setPrevResponses: (state, action) => {
            const observations = action.payload;
            const newPrevResponses = []
            observations.map((obj) => {
                const objToPush = {}
                obj.input.definitions.map((defObj) => {
                    const observationName = defObj.code.text;
                    objToPush[observationName] = {
                        "values": [],
                        "unit": defObj.quantitativeDetails.customaryUnit.coding[0].unit
                    }
                })
                newPrevResponses.push(objToPush)
            })
            state.prevResponses = newPrevResponses;
        },
        updatePrevResponses: (state, action) => {
            const prevSubmittedResponsesArray = action.payload
            prevSubmittedResponsesArray.map((prevResponseObj) => {
                const fieldName = prevResponseObj.code.text
                const notes = prevResponseObj.comment
                const date = prevResponseObj.effectiveDateTime
                const value = prevResponseObj.valueQuantity.value
                const unit = prevResponseObj.valueQuantity.unit
                const id = prevResponseObj.id

                var indexOfObservationArray = 0
                state.prevResponses.map((observationObj, index) => {
                    for (var key in observationObj) {
                        if (key == fieldName) {
                            indexOfObservationArray = index
                        }
                    }
                })
                const updateObj = {
                    value: value,
                    date: date,
                    notes: notes,
                    id: id
                }
                var push = true
                state.prevResponses[indexOfObservationArray][fieldName].values.map((alreadyExitingObj) => {
                    if (alreadyExitingObj.id === id) {
                        push = false
                    }
                })
                if (push) {
                    state.prevResponses[indexOfObservationArray][fieldName].values.push(updateObj)
                }
            })

        }
    }
})

export const selectObservations = (state) => state.observation.observations;
export const selectPrevResponses = (state) => state.observation.prevResponses;

export const {
    setObservations,
    setPrevResponses,
    updatePrevResponses
} = ObservationSlice.actions;

export default ObservationSlice.reducer;