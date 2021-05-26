import { createSlice } from '@reduxjs/toolkit';

const ObservationFormSlice = createSlice({
    name: "observationForm",
    initialState: {
        fieldsArray: []
    },
    reducers: {
        populateFieldsArray: (state, action) => {
            const observations = action.payload;
            const newFieldsArray = []
            observations.map((obj) => {
                const titleObj = {}
                const titleArray = []
                const title = obj.title;
                obj.input.definitions.map((defObj) => {
                    const objToPush = {
                        "text": defObj.code.text,
                        "unit": defObj.quantitativeDetails.unit.coding[0].unit,
                        "display": defObj.display == "false" ? false : true
                    }
                    titleArray.push(objToPush)
                })
                titleObj[title] = titleArray
                newFieldsArray.push(titleObj)
            })
            state.fieldsArray = newFieldsArray;
        }
    }
})

export const selectFieldsArray = (state) => state.observationForm.fieldsArray;

export const { populateFieldsArray } = ObservationFormSlice.actions;

export default ObservationFormSlice.reducer;