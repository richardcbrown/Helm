import { takeEvery, put } from "redux-saga/effects"
import { domainName, getToken } from "../../core/token"
import get from "lodash/get"

import { CHECK_TERMS_ACTION, checkTermsAction } from "../actions/checkTermsAction"

export const checkTermsSaga = takeEvery(CHECK_TERMS_ACTION.REQUEST, function* (action) {
  const url = domainName + "/api/initialise/terms"
  const token = getToken()

  let options = {
    method: "GET",
    credentials: "same-origin",
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" })
  }
  options.headers = {
    Authorization: `Bearer ${token}`,
    "X-Requested-With": "XMLHttpRequest",
  }
  try {
    let statusCode

    const result = yield fetch(url, options)
      .then((res) => {
        statusCode = res.status

        return res.json()
      })
      .then((response) => {
        const isJwtMessage = (status) => {
          return Number(status) === 401 || Number(status) === 403
        }

        if (isJwtMessage(statusCode)) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          localStorage.removeItem("username")
          localStorage.removeItem("role")
          window.location.href = "/#/login"
          return
        }

        const isPatientNotFoundError = (status, message) => {
          return Number(status) === 400 && typeof message === "string" && message.includes("patient_notfound")
        }

        if (isPatientNotFoundError(statusCode, response.error)) {
          return {
            title: "Error",
            message: "You are not currently enrolled to use Helm, please try again later.",
          }
        }

        const status = get(response, "status", null)

        if (status === "login") {
          window.location.href = "/"
          return true
        }

        if (status === "sign_terms") {
          window.location.href = "/#/terms"
          return true
        }

        if (status === "patient_notfound") {
          return {
            title: "Error",
            message: "You are not currently enrolled to use Helm, please try again later.",
          }
        }

        return response
      })

    if (result === true) {
      yield put(checkTermsAction.success(result))
    } else {
      yield put(checkTermsAction.error(result))
    }
  } catch (e) {
    yield put(checkTermsAction.error(e))
  }
})
