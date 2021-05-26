import { createSlice } from '@reduxjs/toolkit';

const ContentSlice = createSlice({
    name: "content",
    initialState: {
        information: []
    },
    reducers: {
        populateInformation: (state, action) => {
            const observationsArray = action.payload;
            const newInformation = []
            observationsArray.map((obj) => {
                newInformation.push(obj.information)
            })
            state.information = newInformation;
        }
    }
})

export const selectInformation = (state) => state.content.information

export const { populateInformation } = ContentSlice.actions;

export default ContentSlice.reducer;