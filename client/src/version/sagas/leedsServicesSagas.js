import React from "react"
import { takeEvery, put } from "redux-saga/effects"
import { Typography } from "@material-ui/core"

import { SYNOPSIS_LEEDSSERVICES_ACTION, synopsisLeedsServicesAction } from "../actions/synopsisActions"

export const getLeedsServicesSaga = takeEvery(SYNOPSIS_LEEDSSERVICES_ACTION.REQUEST, function* (action) {
  yield put(
    synopsisLeedsServicesAction.success({
      heading: "Leeds",
      synopsis: [
        {
          text: (
            <React.Fragment>
              <a href="https://www.commlinks.co.uk/?service=linking-leeds" rel="noopener noreferrer" target="_blank">
                <Typography>Social Prescribing</Typography>
              </a>
              <Typography>
                Connecting people to services and activities in their local community within Leeds
              </Typography>
            </React.Fragment>
          ),
        },
        {
          text: (
            <React.Fragment>
              <a href="https://www.mindwell-leeds.org.uk" rel="noopener noreferrer" target="_blank">
                <Typography>Mindwell</Typography>
              </a>
              <Typography>Mental health information and support for everyone in Leeds</Typography>
            </React.Fragment>
          ),
        },
        {
          text: (
            <React.Fragment>
              <a href="https://www.mindmate.org.uk" rel="noopener noreferrer" target="_blank">
                <Typography>Mindmate</Typography>
              </a>
              <Typography>
                Mental health information and support specially designed for young people in Leeds
              </Typography>
            </React.Fragment>
          ),
        },
        {
          text: (
            <React.Fragment>
              <a href="https://leeds.omnitherapy.org" rel="noopener noreferrer" target="_blank">
                <Typography>Omnihealth</Typography>
              </a>
              <Typography>
                Online mental health therapy available to anyone over the age of 17 and registered with a GP in Leeds
              </Typography>
            </React.Fragment>
          ),
        },
      ],
    })
  )
})
