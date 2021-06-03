import React, { useEffect } from "react";

import moment from 'moment';

import { Line } from "react-chartjs-2";

import {
    useSelector,
    useDispatch
} from 'react-redux';
import {
    selectDisplayRows,
    selectRows
} from '../table/TableSlice';
import {
    selectValue
} from '../tabs/ObservationTabsSlice';
import {
    populateDatasets,
    populateLabels,
    selectDatasets,
    selectLabels
} from "./ObservationGraphSlice";

export default function ObservationGraph(props) {
    const value = useSelector(selectValue)
    const rows = useSelector(selectRows)
    const labels = useSelector(selectLabels)
    const datasets = useSelector(selectDatasets)
    const displayRows = useSelector(selectDisplayRows)
    const dateFormat = "YYYY-MM-DD"
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(populateDatasets(rows[value]))
        dispatch(populateLabels(rows[value]))
    }, [displayRows])

    useEffect(() => {
        orderData()
    }, [displayRows])

    const orderData = () => {
        const newLabels = obtainLast30DaysLabels()
        const newDisplayRows = obtainNewDisplayRows(newLabels)
        console.log("newDisplayRows: ", newDisplayRows)

        const allData = {}

        const keyArray = Object.keys(rows[value])
        keyArray.map((key) => {
            allData[key] = obtainKeyArray(key, newDisplayRows)
        })

        console.log("allData: ", allData)

        dispatch(populateDatasets(allData))
        dispatch(populateLabels(allData))
    }

    const obtainNewDisplayRows = (newLabels) => {
        const newDisplayRows = []

        const datesIncluded = []
        const dateArray = rows[value].Date
        newLabels.map((date) => {
            if (dateArray.includes(date)) {
                datesIncluded.push(date)
            }
        })
        datesIncluded.map((date) => {
            if (newLabels.includes(date)) {
                const index = newLabels.indexOf(date)
                newLabels.splice(index, 1)
            }
        })

        newLabels.map((date) => {
            const nullObj = {
                "Date": date
            }
            for (var key in rows[value]) {
                if (key !== "Date") {
                    nullObj[key] = null
                }
            }
            newDisplayRows.push(nullObj)
        })

        datesIncluded.map((date) => {
            displayRows.map((obj) => {
                if (date == obj.Date) {
                    newDisplayRows.push(obj)
                }
            })
        })
        return newDisplayRows.sort(compare)
    }

    const compare = (a, b) => {
        const dateA = a.Date
        const dateB = b.Date

        let comparison = 0;
        if (dateA > dateB) {
            comparison = 1;
        };
        if (dateB > dateA) {
            comparison = -1
        };

        return comparison;
    }

    const obtainLast30DaysLabels = () => {
        const finalDate = obtainFormattedDate(new Date())
        const momentFinalDate = moment(finalDate)
        const newLabels = [finalDate]

        for (var i = 0; i < 30; i++) {
            newLabels.push(momentFinalDate.subtract(1, "days").format(dateFormat))
        }
        return newLabels
    }



    const obtainFormattedDate = (date) => {
        const [day, month, year] = date.toLocaleDateString("en-GB").split("/")
        const transformedDate = `${year}-${month}-${day}`
        return transformedDate
    }

    const obtainKeyArray = (key, arrayOfObject) => {
        const keyArray = []
        arrayOfObject.map((obj) => {
            keyArray.push(obj[key])
        })
        return keyArray
    }




    return (
        <Line data={{ labels: labels, datasets: datasets }} />
    );
}