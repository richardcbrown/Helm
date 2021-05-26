import { createSlice } from '@reduxjs/toolkit';

const ObservationTabsSlice = createSlice({
    name: "observation",
    initialState: {
        //0=Height&Weight, 1=Blood Pressure, 2=Oxygen Saturation
        value: 0,
        tabTitles: [
            "Height & Weight",
            "Pulse",
            "Blood Pressure",
            "Oxygen Saturation",
            "Peak Flow"
        ]
    },
    reducers: {
        setValue: (state, action) => {
            state.value = Number(action.payload)
        },
        setTabTitles: (state, action) => {

        }
    }
})

export const selectValue = (state) => state.observation.value;
export const selectTabTitles = (state) => state.observation.tabTitles;

export const { setValue, setTabTitles } = ObservationTabsSlice.actions;

export default ObservationTabsSlice.reducer;