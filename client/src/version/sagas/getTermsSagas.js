import { takeEvery, put } from "redux-saga/effects"
import { domainName, getToken } from "../../core/token"
import get from "lodash/get"

import { GET_TERMS_ACTION, getTermsAction } from "../actions/getTermsAction"

export const getTermsSaga = takeEvery(GET_TERMS_ACTION.REQUEST, function* (action) {
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
          window.location.href = "/#/login"
          return
        }

        return response.resources
      })

    if (result.message) {
      yield put(getTermsAction.error(result))
    } else {
      yield put(getTermsAction.success(result))
    }
  } catch (e) {
    yield put(getTermsAction.error(e))
  }
})
