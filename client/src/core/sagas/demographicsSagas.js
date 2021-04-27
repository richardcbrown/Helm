import get from "lodash/get"
import { takeEvery, put } from "redux-saga/effects"

import { domainName, getToken } from "../token"
import { DEMOGRAPHICS_ACTION, demographicsAction } from "../actions/demographicsAction"
import { httpErrorAction } from "../actions/httpErrorAction"

let responseInfo = {}

export default takeEvery(DEMOGRAPHICS_ACTION.REQUEST, function* (action) {
  const url = domainName + "/api/demographics"
  const token = getToken()
  let options = {
    credentials: "same-origin",
  }
  options.method = "GET"
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" })
  }
  options.headers = {
    "X-Requested-With": "XMLHttpRequest",
    Authorization: `Bearer ${token}`,
  }
  try {
    const result = yield fetch(url, options)
      .then((res) => {
        responseInfo.status = get(res, "status", null)
        return res.json()
      })
      .then((res) => {
        if (responseInfo.status !== 200) {
          responseInfo.errorMessage = get(res, "error", null)
          return false
        }

        const status = get(res, "status", null)

        if (status && status === "sign_terms") {
          window.location.href = "/#/login"
          return null
        }

        if (res.demographics.name) {
          localStorage.setItem("username", res.demographics.name)
        }

        return res
      })

    if (responseInfo.status === 200) {
      yield put(demographicsAction.success(result))
    } else {
      yield put(
        httpErrorAction.save({
          status: responseInfo.status,
          message: responseInfo.errorMessage,
        })
      )
    }
  } catch (e) {
    yield put(demographicsAction.error(e))
  }
})
