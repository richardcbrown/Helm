import get from "lodash/get"
import { takeEvery, put } from "redux-saga/effects"

import { getToken, domainName } from "../../core/token"
import { httpErrorAction } from "../../core/actions/httpErrorAction"
import { flattenQuestionnaireResponse } from "../fhir/QuestionnaireResponse"

const apiPatientsUser = "api/patient/fhir"
let responseInfo = {}

function compositionSynopsis(composition) {
  const section = composition.section || []

  return {
    synopsis: section.map((s) => ({ id: composition.id, text: s.title })),
  }
}

/**
 * @param {fhir.QuestionnaireResponse} questionnaireResponse
 */
function questionnaireResponseSynopsis(questionnaireResponse) {
  const { name1, name2, name3 } = flattenQuestionnaireResponse(questionnaireResponse)

  return {
    synopsis: [
      { id: questionnaireResponse.id, text: name1 },
      { id: questionnaireResponse.id, text: name2 },
      { id: questionnaireResponse.id, text: name3 },
    ],
  }
}

function createFhirSynopsis(resources) {
  const [resource] = resources

  if (!resource) {
    return {
      synopsis: [],
    }
  }

  switch (resource.resourceType) {
    case "QuestionnaireResponse": {
      return questionnaireResponseSynopsis(resource)
    }
    case "Composition": {
      return compositionSynopsis(resource)
    }
    default: {
      throw Error(`Unrecognised resource ${resource.resourceType}`)
    }
  }
}

export default function createFhirSynopsisSaga(actionName, actionType, resourceType, query) {
  return takeEvery(actionName.REQUEST, function* (action) {
    const url = `${domainName}/${apiPatientsUser}/${resourceType}?${query}`
    const token = getToken()

    const options = {
      credentials: "same-origin",
    }
    options.method = "GET"
    if (!options.headers) {
      options.headers = new Headers({ Accept: "application/json" })
    }
    options.headers = {
      Authorization: "Bearer " + token,
      "X-Requested-With": "XMLHttpRequest",
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

          return res
        })

      if (responseInfo.status === 200) {
        const resources =
          result.entry &&
          result.entry.map((entry) => entry.resource).filter((res) => !!res && res.resourceType === resourceType)

        yield put(actionType.success(createFhirSynopsis(resources)))
      } else {
        yield put(
          httpErrorAction.save({
            status: responseInfo.status,
            message: responseInfo.errorMessage,
          })
        )
      }
    } catch (e) {
      yield put(actionType.error(e))
    }
  })
}

export function createFhirBundleSaga(actionName, actionType) {
  return takeEvery(actionName.REQUEST, function* (action) {
    const { key, resourceType, query } = action

    const url = `${domainName}/${apiPatientsUser}/${resourceType}?${query}`
    const token = getToken()
    const options = {
      credentials: "same-origin",
    }
    options.method = "GET"
    if (!options.headers) {
      options.headers = new Headers({ Accept: "application/json" })
    }
    options.headers = {
      Authorization: "Bearer " + token,
      "X-Requested-With": "XMLHttpRequest",
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

          return res
        })

      if (responseInfo.status === 200) {
        yield put(actionType.success(key, resourceType, result))
      } else {
        yield put(
          httpErrorAction.save({
            status: responseInfo.status,
            message: responseInfo.errorMessage,
          })
        )
      }
    } catch (e) {
      yield put(actionType.error(key, resourceType, e))
    }
  })
}

export function createFhirResourceSaga(actionName, actionType) {
  return takeEvery(actionName.REQUEST, function* (action) {
    const { data, resourceType, key } = action
    const { resource, completedAction } = data

    const url = `${domainName}/${apiPatientsUser}/${resourceType}`
    const token = getToken()
    const options = {
      credentials: "same-origin",
    }
    options.method = "POST"

    options.headers = {
      Authorization: `Bearer ${token}`,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    }

    options.body = JSON.stringify(resource)

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

          return res
        })

      if (responseInfo.status === 200) {
        yield put(actionType.success(key, resourceType, result))

        if (completedAction) {
          yield put(completedAction())
        }
      } else {
        yield put(
          httpErrorAction.save({
            status: responseInfo.status,
            message: responseInfo.errorMessage,
          })
        )
      }
    } catch (e) {
      yield put(actionType.error(key, resourceType, e))
    }
  })
}
