import { createRequestTypes } from "../../core/actions/functions"

export const GET_FHIR_RESOURCES_ACTION = createRequestTypes("GET_FHIR_RESOURCES_ACTION")

export const getFhirResourcesAction = {
  request: (key, resourceType, query) => ({ type: GET_FHIR_RESOURCES_ACTION.REQUEST, key, resourceType, query }),
  success: (key, resourceType, data) => ({ type: GET_FHIR_RESOURCES_ACTION.SUCCESS, key, resourceType, data }),
  error: (key, resourceType, error) => ({ type: GET_FHIR_RESOURCES_ACTION.FAILURE, key, resourceType, error }),
}
