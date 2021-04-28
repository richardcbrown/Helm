import { takeEvery } from "redux-saga/effects"

export const topThreeThingsSaga = takeEvery("RA/CRUD_CREATE_SUCCESS", function* (action) {
  const { resource } = action.meta

  if (resource === "top3Things") {
    window.location.reload()
  }
})
