import { CREATE_FHIR_RESOURCE_ACTION } from "../actions/createFhirResourceAction"
import { GET_FHIR_RESOURCES_ACTION } from "../actions/getFhirResourcesAction"

const initialState = {}

function applyState(state, key, resourceType, newSlice) {
  const newState = { ...state }

  newState[key] = newState[key] || {}

  newState[key][resourceType] = newSlice

  return newState
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_FHIR_RESOURCES_ACTION.REQUEST: {
      return applyState(state, action.key, action.resourceType, {
        loading: true,
        data: state.data,
      })
    }
    case GET_FHIR_RESOURCES_ACTION.SUCCESS: {
      return applyState(state, action.key, action.resourceType, {
        loading: false,
        data: action.data,
      })
    }
    case GET_FHIR_RESOURCES_ACTION.FAILURE: {
      return applyState(state, action.key, action.resourceType, {
        loading: false,
        data: null,
        error: action.error,
      })
    }
    default: {
      return state
    }
  }
}

export function createFhirResourceReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_FHIR_RESOURCE_ACTION.REQUEST: {
      return applyState(state, action.key, action.resourceType, {
        loading: true,
      })
    }
    case CREATE_FHIR_RESOURCE_ACTION.SUCCESS: {
      return applyState(state, action.key, action.resourceType, {
        loading: false,
      })
    }
    case CREATE_FHIR_RESOURCE_ACTION.FAILURE: {
      return applyState(state, action.key, action.resourceType, {
        loading: false,
        error: action.error,
      })
    }
    default: {
      return state
    }
  }
}
