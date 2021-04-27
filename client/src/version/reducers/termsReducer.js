import { GET_TERMS_ACTION } from "../actions/getTermsAction"
import { CHECK_TERMS_ACTION } from "../actions/checkTermsAction"

const initialState = {
  data: [],
  loading: false,
  error: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_TERMS_ACTION.REQUEST:
      return {
        ...state,
        loading: true,
        data: state.data,
      }
    case GET_TERMS_ACTION.SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data,
      }
    case CHECK_TERMS_ACTION.FAILURE:
    case GET_TERMS_ACTION.FAILURE: {
      return {
        ...state,
        loading: false,
        data: [],
        error: action.error,
      }
    }
    default:
      return state
  }
}
