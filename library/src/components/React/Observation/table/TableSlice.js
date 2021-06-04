import { createSlice } from "@reduxjs/toolkit"

const TableSlice = createSlice({
    name: "table",
    initialState: {
        headers: [],
        rows: [],
        displayRows: [],
    },
    reducers: {
        populateRows: (state, action) => {
            console.log("populateRows")
            console.log(action.payload)
            const newRowsArray = []
            const prevResponses = action.payload
            prevResponses.map((responseObjForTab) => {
                const objToPush = {}
                for (var observationKey in responseObjForTab) {
                    console.log("responseObjForTab: ", responseObjForTab[observationKey])
                    if (typeof responseObjForTab[observationKey] === "object") {
                        const valueArray = []
                        const dateArray = []
                        responseObjForTab[observationKey].values.map((valueObj) => {
                            valueArray.push(valueObj.value)
                            dateArray.push(valueObj.date)
                        })
                        objToPush["Date"] = dateArray
                        objToPush[observationKey] = valueArray
                    }
                }
                newRowsArray.push(objToPush)
            })
            state.rows = newRowsArray
        },
        populateHeaders: (state, action) => {
            const fieldsArray = action.payload
            const newHeadersArray = []
            fieldsArray.map((tabFieldsObj) => {
                const headersArray = []
                headersArray.push({
                    header: "Date",
                    unit: "",
                })
                for (var key in tabFieldsObj) {
                    tabFieldsObj[key].map((observationObj) => {
                        const headerObj = {}
                        const text = observationObj.text
                        const unit = observationObj.unit
                        headerObj["header"] = text
                        headerObj["unit"] = unit
                        headersArray.push(headerObj)
                    })

                    newHeadersArray.push(headersArray)
                }
            })
            state.headers = newHeadersArray
        },
        populateDisplayRows: (state, action) => {
            state.displayRows = action.payload
        },
    },
})

export const selectHeaders = (state) => state.table.headers
export const selectRows = (state) => state.table.rows
export const selectDisplayRows = (state) => state.table.displayRows

export const { populateRows, populateHeaders, populateDisplayRows } = TableSlice.actions

export default TableSlice.reducer
