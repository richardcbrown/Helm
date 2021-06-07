import { takeEvery } from "redux-saga/effects"

export const aboutMeSaga = takeEvery("RA/CRUD_CREATE_SUCCESS", function* (action) {
  const { resource } = action.meta

  if (resource === "about-me") {
    window.location.reload()
  }
})
