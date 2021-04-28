import { takeEvery, put } from "redux-saga/effects"

import { SYNOPSIS_NHSSERVICES_ACTION, synopsisNhsServicesAction } from "../actions/synopsisActions"

export const getNhsServicesSaga = takeEvery(SYNOPSIS_NHSSERVICES_ACTION.REQUEST, function* (action) {
  yield put(
    synopsisNhsServicesAction.success({
      heading: "nhs",
      synopsis: [
        {
          text: "NHS Live Well",
        },
        {
          text: "A-Z",
        },
        {
          text: "Social Care Support",
        },
      ],
    })
  )
})
