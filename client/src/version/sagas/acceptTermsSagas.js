import { takeEvery, put } from "redux-saga/effects"
import get from "lodash/get"

import { domainName, getToken } from "../../core/token"
import { ACCEPT_TERMS_ACTION, acceptTermsAction } from "../actions/acceptTermsAction"

export const acceptTermsSaga = takeEvery(ACCEPT_TERMS_ACTION.REQUEST, function* (action) {
  const url = domainName + "/api/initialise/terms/accept"
  const token = getToken()

  let options = {
    method: "POST",
    body: JSON.stringify(action.data),
    credentials: "same-origin",
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" })
  }
  options.headers = {
    Authorization: `Bearer ${token}`,
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  }
  try {
    const result = yield fetch(url, options)
      .then((res) => res.json())
      .then((response) => {
        const redirectUrl = get(response, "redirectURL", null)
        const status = get(response, "status", null)

        if (redirectUrl) {
          window.location.href = redirectUrl
          return response
        } else if (status === "login" || response.status !== 200) {
          window.location.href = "/#/login"
        }

        return response
      })

    yield put(acceptTermsAction.success(result))
  } catch (e) {
    yield put(acceptTermsAction.error(e))
  }
})
