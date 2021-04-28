import { takeEvery, put } from "redux-saga/effects"
import get from "lodash/get"

import { domainName, getToken } from "../token"
import { INITIALIZE_ACTION, initializeAction } from "../actions/initializeAction"
import { logout } from "../dataProviders/authProvider"

export default takeEvery(INITIALIZE_ACTION.REQUEST, function* (action) {
  const url = domainName + "/api/initialise"
  const token = getToken()

  let options = {
    credentials: "same-origin",
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" })
  }
  options.headers = {
    "X-Requested-With": "XMLHttpRequest",
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const result = yield fetch(url, options)
      .then((res) => res.json())
      .then((response) => {
        const redirectUrl = get(response, "redirectURL", null)
        const status = get(response, "status", null)

        if (response.error) {
          logout()
          return false
        } else if (redirectUrl) {
          window.location.href = redirectUrl
        } else if (status === "sign_terms") {
          window.location.href = "/#/terms"
        } else if (status === "login") {
          window.location.href = "/"
        } else {
          window.location.href = "/#/login"
        }

        return response
      })

    if (result === false) {
      logout()
    } else {
      yield put(initializeAction.success(result))
    }
  } catch (e) {
    yield put(initializeAction.error(e))
  }
})
