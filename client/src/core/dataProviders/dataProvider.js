import get from "lodash/get"
import moment from "moment"
import queryString from "querystring"
import { GET_LIST, GET_ONE, CREATE, UPDATE, HttpError } from "react-admin"
import sort, { ASC, DESC } from "sort-array-objects"

import pluginFilters from "../config/pluginFilters"
import { getToken, domainName } from "../token"

import { httpErrorAction } from "../actions/httpErrorAction"

const apiPatientsUser = "api/patient/fhir"
const patientID = localStorage.getItem("patientId") ? localStorage.getItem("patientId") : localStorage.getItem("userId")

const urlSelector = (resource, queryProps) => {
  switch (resource) {
    case "leeds-information": {
      return `${domainName}/api/repository${queryProps ? `?${queryString.stringify(queryProps)}` : ""}`
    }
    case "patients": {
      return `${domainName}/api/${resource}`
    }
    default: {
      return `${domainName}/${apiPatientsUser}/${patientID}/detail/${resource}`
    }
  }
}

/**
 * This constant prepare data for requests (URL and options)
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape}  type
 * @param {string} resource
 * @param {shape}  params
 */
const convertDataRequestToHTTP = (type, resource, params) => {
  const token = getToken()

  let url = ""
  const options = {
    credentials: "same-origin",
  }
  switch (type) {
    case GET_LIST: {
      url = urlSelector(resource, params)

      if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" })
      }
      options.headers = {
        Authorization: "Bearer " + token,
        "X-Requested-With": "XMLHttpRequest",
      }
      break
    }

    case GET_ONE:
      url = `${domainName}/${apiPatientsUser}/${resource}/${params.id}`
      if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" })
      }
      options.headers = {
        Authorization: "Bearer " + token,
        "X-Requested-With": "XMLHttpRequest",
      }
      break

    case UPDATE:
      let data = Object.assign({ userId: patientID }, params.data)
      url = `${domainName}/${apiPatientsUser}/${patientID}/${resource}/${params.id}`
      options.method = "PUT"
      if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" })
      }
      options.headers = {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      }
      options.body = JSON.stringify(data)
      break

    case CREATE:
      //data = Object.assign({userId: patientID}, params.data);
      const createResource = params.data

      if (!createResource.resourceType) {
        throw Error("Resource does not have a resourceType")
      }

      url = `${domainName}/${apiPatientsUser}/${createResource.resourceType}`
      options.method = "POST"
      if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" })
      }
      options.headers = {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      }
      options.body = JSON.stringify(createResource)
      break

    default:
      throw new Error(`Unsupported fetch action type ${type}`)
  }
  return { url, options }
}

/**
 * This function extracts results from response
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {string} resource
 * @param {shape}  response
 * @param {shape}  params
 * @return {array}
 */
function getResultsFromResponse(resource, response, params) {
  let results = []

  results = response.map((item, id) => {
    return Object.assign({ id: item.sourceId }, item)
  })

  return results
}

/**
 * This function cheks is current item consider to filter condition
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape}  item
 * @param {shape}  filters
 * @param {string} filterText
 * @return {boolean}
 */
function isItemConsider(item, filters, filterText) {
  let result = false
  filters.forEach((filterItem) => {
    let string = item[filterItem]
    if (String(string).toLowerCase().search(filterText) >= 0) {
      result = true
    }
  })
  return result
}

/**
 * This function filters response array
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {string} resource
 * @param {array}  results
 * @param {shape}  params
 * @return {array}
 */
function getFilterResults(resource, results, params) {
  const filterText = get(params, "filter.filterText", null)
  const filters = pluginFilters[resource]
  return !filterText ? results : results.filter((item) => isItemConsider(item, filters, filterText))
}

/**
 * This function sorts response array
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {array}  results
 * @param {shape}  params
 * @return {array}
 */
function getSortedResults(results, params) {
  const sortField = get(params, "sort.field", null)
  const sortOrder = get(params, "sort.order", null) === "DESC" ? DESC : ASC
  return sort(results, [sortField], sortOrder)
}

/**
 * This constant handle response data
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape}  response
 * @param {shape}  type
 * @param {string} resource
 * @param {shape}  params
 */
const convertHTTPResponse = (response, type, resource, params) => {
  switch (type) {
    case GET_LIST:
      if (resource === "leeds-information") {
        return response
      }

      const pageNumber = get(params, "pagination.page", 1)
      const numberPerPage = get(params, "pagination.perPage", 10)
      const results = getResultsFromResponse(resource, response, params)
      const resultsFiltering = getFilterResults(resource, results, params)
      const resultsSorting = getSortedResults(resultsFiltering, params)
      const startItem = (pageNumber - 1) * numberPerPage
      const endItem = pageNumber * numberPerPage
      const paginationResults = resultsSorting.slice(startItem, endItem)
      return {
        data: paginationResults,
        total: resultsSorting.length,
      }

    case GET_ONE:
      return {
        data: Object.assign({ id: response.sourceId }, response),
      }

    case UPDATE:
      return params

    case CREATE:
      const dataFromRequest = get(params, "data", null)
      const compositionUid = get(response, "compositionUid", null)
      let sourceID = ""
      if (compositionUid) {
        const compositionUidArray = compositionUid.split("::")
        sourceID = compositionUidArray[0]
      }
      dataFromRequest.id = get(response, "host", null) + "-" + sourceID
      if (!get(params, "source", null)) {
        dataFromRequest.source = "ethercis"
      }
      return {
        data: dataFromRequest,
      }

    default:
      return { data: "No results" }
  }
}

const dataProvider = (type, resource, params) => {
  const { url, options } = convertDataRequestToHTTP(type, resource, params)

  let responseInfo = ""
  return fetch(url, options)
    .then((response) => {
      responseInfo = get(response, "status", null)
      return response.json()
    })
    .then((res) => {
      if (responseInfo !== 200) {
        responseInfo += "|" + get(res, "error", null)
        throw new HttpError(responseInfo)
      }

      return convertHTTPResponse(res, type, resource, params)
    })
    .catch((err) => {
      console.log("Error: ", err)
      throw new Error(err)
    })
}

/**
 * This function provides requests/response to server
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {shape}  type
 * @param {string} resource
 * @param {shape}  params
 */
export default (type, resource, params) => {
  return dataProvider(type, resource, params)
}
