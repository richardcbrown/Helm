import { takeEvery } from "redux-saga/effects"

export const measurementsSaga = takeEvery("RA/CRUD_CREATE_SUCCESS", function* (action) {
    const { resource } = action.meta

    if (resource === "measurement") {
        window.location.reload()
    }
})
