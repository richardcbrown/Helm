import { createSlice } from '@reduxjs/toolkit';

const ObservationTabsSlice = createSlice({
    name: "observationTabs",
    initialState: {
        //0=Height&Weight, 1=Blood Pressure, 2=Oxygen Saturation
        value: 0,
        tabTitles: []
    },
    reducers: {
        setValue: (state, action) => {
            state.value = Number(action.payload)
        },
        setTabTitles: (state, action) => {
            const observationsArray = action.payload
            const newTabTitles = []
            observationsArray.map((obj) => {
                newTabTitles.push(obj.title)
            })
            state.tabTitles = newTabTitles;
        }
    }
})

export const selectValue = (state) => state.observationTabs.value;
export const selectTabTitles = (state) => state.observationTabs.tabTitles;

export const { setValue, setTabTitles } = ObservationTabsSlice.actions;

export default ObservationTabsSlice.reducer;