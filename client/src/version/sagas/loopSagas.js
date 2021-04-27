import React from "react"
import { takeEvery, put } from "redux-saga/effects"
import { Link } from "react-router-dom"
import Typography from "@material-ui/core/Typography"

import { SYNOPSIS_LOOPSERVICES_ACTION, synopsisLoopServicesAction } from "../actions/synopsisActions"

export const getLoopServicesSaga = takeEvery(SYNOPSIS_LOOPSERVICES_ACTION.REQUEST, function* (action) {
  yield put(
    synopsisLoopServicesAction.success({
      heading: "leeds-information",
      synopsis: [
        {
          text: "Local service information and resources to support your health and care.",
        },
        {
          text: (
            <Typography>
              <Link to="/leeds-information" aria-label="Search">
                Search
              </Link>
            </Typography>
          ),
        },
      ],
    })
  )
})
