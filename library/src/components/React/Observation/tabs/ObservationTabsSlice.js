import { createSlice } from '@reduxjs/toolkit';

const ObservationTabsSlice = createSlice({
    name: "observation",
    initialState: {
        //0=Height&Weight, 1=Blood Pressure, 2=Oxygen Saturation
        value: 0
    },
    reducers: {
        setValue: (state, action) => {
            state.value = Number(action.payload)
        }
    }
})

export const selectValue = (state) => state.observation.value;

export const { setValue } = ObservationTabsSlice.actions;

export default ObservationTabsSlice.reducer;