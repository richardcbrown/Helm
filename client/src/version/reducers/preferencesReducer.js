import { GET_PREFERENCES_ACTION } from "../actions/preferencesActions"

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_PREFERENCES_ACTION.REQUEST: {
      return {
        loading: true,
        data: state.data,
      }
    }
    case GET_PREFERENCES_ACTION.SUCCESS: {
      return {
        error: null,
        loading: false,
        data: action.data,
      }
    }
    case GET_PREFERENCES_ACTION.FAILURE: {
      return {
        loading: false,
        data: null,
        error: action.error,
      }
    }
    default:
      return state
  }
}
