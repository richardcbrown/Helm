import { createRequestTypes } from "../../core/actions/functions"

export const GET_TERMS_ACTION = createRequestTypes("GET_TERMS_ACTION")

export const getTermsAction = {
  request: (data) => ({ type: GET_TERMS_ACTION.REQUEST, data }),
  success: (data) => ({ type: GET_TERMS_ACTION.SUCCESS, data }),
  error: (error) => ({ type: GET_TERMS_ACTION.FAILURE, error }),
}
