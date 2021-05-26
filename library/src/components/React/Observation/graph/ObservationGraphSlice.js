import { createSlice } from '@reduxjs/toolkit';

const ObservationGraphSlice = createSlice({
    name: "observationGraph",
    initialState: {
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "First dataset",
                    data: [33, 53, 85, 41, 44, 65],
                    fill: true,
                    backgroundColor: "rgba(75,192,192,0.2)",
                    borderColor: "rgba(75,192,192,1)"
                },
                {
                    label: "Second dataset",
                    data: [33, 25, 35, 51, 54, 76],
                    fill: false,
                    borderColor: "#742774"
                }
            ]
        }
    },
    reducers: {
        populateData: (state, action) => {

        }
    }
})

export const selectData = (state) => state.observationGraph.data;

export const { populateData } = ObservationGraphSlice.actions;

export default ObservationGraphSlice.reducer;