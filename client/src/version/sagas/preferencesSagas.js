import { getToken, domainName } from "../../core/token"
import { httpErrorAction } from "../../core/actions/httpErrorAction"

import { put, takeEvery } from "redux-saga/effects"
import {
  GET_PREFERENCES_ACTION,
  getPreferencesAction,
  savePreferencesAction,
  SAVE_PREFERENCES_ACTION,
} from "../actions/preferencesActions"

const preferencesRoot = "api/preferences"

function* getPreferences(action) {
  try {
    const url = `${domainName}/${preferencesRoot}`
    const token = getToken()
    const options = {
      credentials: "same-origin",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    }

    const result = yield fetch(url, options)

    if (!result.ok) {
      const { status } = result

      yield put(
        httpErrorAction.save({
          status: status,
          message: "An error occurred getting preferences",
        })
      )

      return
    }

    let preferences = null

    try {
      preferences = yield result.json()
    } catch (_) {
      preferences = null
    }

    yield put(getPreferencesAction.success(preferences))
  } catch (e) {
    yield put(getPreferencesAction.error(e))
  }
}

function* savePreferences(action) {
  try {
    const preferences = action.data

    const url = `${domainName}/${preferencesRoot}`
    const token = getToken()
    const options = {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    }

    const result = yield fetch(url, options)

    if (!result.ok) {
      const { status } = result

      yield put(
        httpErrorAction.save({
          status: status,
          message: "An error occurred saving preferences",
        })
      )

      return
    }

    let newPreferences = null

    try {
      newPreferences = yield result.json()
    } catch (_) {
      newPreferences = null
    }

    yield put(getPreferencesAction.success(newPreferences))

    yield put(savePreferencesAction.success())
  } catch (e) {
    yield put(savePreferencesAction.error(e))
  }
}

export const getPreferencesSaga = takeEvery(GET_PREFERENCES_ACTION.REQUEST, getPreferences)
export const savePreferencesSaga = takeEvery(SAVE_PREFERENCES_ACTION.REQUEST, savePreferences)
