import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"

import { useSelector, useDispatch } from "react-redux"
import { selectHeaders, selectRows, populateHeaders, populateRows, populateDisplayRows } from "./TableSlice"
import { selectPrevResponses } from "../ObservationSlice"
import { selectValue } from "../tabs/ObservationTabsSlice"
import { selectFieldsArray } from "../form/ObservationFormSlice"
import { Typography } from "@material-ui/core"

const useStyles = makeStyles({
    table: {
        minWidth: 800,
    },
})
export default function BasicTable() {
    const classes = useStyles()
    const headers = useSelector(selectHeaders)
    const rows = useSelector(selectRows)
    const prevResponses = useSelector(selectPrevResponses)
    const fieldsArray = useSelector(selectFieldsArray)
    const value = useSelector(selectValue)
    const dispatch = useDispatch()

    const [displayRows, setDisplayRows] = useState([])

    useEffect(() => {
        const dataForTab = rows[value]
        var lengthOfValues = 0
        for (var key in dataForTab) {
            lengthOfValues = dataForTab[key].length
            break
        }

        const displayRowArray = []
        for (var i = 0; i < lengthOfValues; i++) {
            const displayRowObj = {}
            for (var key in dataForTab) {
                displayRowObj[key] = dataForTab[key][i]
            }
            displayRowArray.push(displayRowObj)
        }
        displayRowArray.sort(compare)
        setDisplayRows(displayRowArray)
        dispatch(populateDisplayRows(displayRowArray))
    }, [rows, value])

    useEffect(() => {
        dispatch(populateHeaders(fieldsArray))
    }, [fieldsArray])
    useEffect(() => {
        dispatch(populateRows(prevResponses))
    }, [prevResponses])

    const tableRows = () => {
        const finalJSX = []
        displayRows.map((row, index) => {
            const rowJSX = []
            for (var key in row) {
                rowJSX.push(<TableCell>{row[key]}</TableCell>)
            }
            const finalRowJSX = <TableRow>{rowJSX}</TableRow>

            finalJSX.push(finalRowJSX)
        })
        return finalJSX
    }

    const compare = (a, b) => {
        const dateA = a.Date
        const dateB = b.Date

        let comparison = 0
        if (dateA > dateB) {
            comparison = 1
        }
        if (dateB > dateA) {
            comparison = -1
        }

        return comparison
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {headers.length > 0 &&
                            headers[value].map((headersObj, index) => (
                                <TableCell>
                                    {headersObj.header}&nbsp;{headersObj.unit ? `(${headersObj.unit})` : null}
                                </TableCell>
                            ))}
                    </TableRow>
                </TableHead>
                <TableBody>{tableRows()}</TableBody>
            </Table>
        </TableContainer>
    )
}
