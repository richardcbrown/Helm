import { createRequestTypes } from "../../core/actions/functions"

export const CREATE_FHIR_RESOURCE_ACTION = createRequestTypes("CREATE_FHIR_RESOURCE_ACTION")

export const createFhirResourceAction = {
  request: (key, resourceType, data) => ({
    type: CREATE_FHIR_RESOURCE_ACTION.REQUEST,
    key,
    resourceType,
    data,
  }),
  success: (key, resourceType, data) => ({ type: CREATE_FHIR_RESOURCE_ACTION.SUCCESS, key, resourceType, data }),
  error: (key, resourceType, error) => ({ type: CREATE_FHIR_RESOURCE_ACTION.FAILURE, key, resourceType, error }),
}
