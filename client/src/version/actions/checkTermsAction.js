import { createRequestTypes } from "../../core/actions/functions"

export const CHECK_TERMS_ACTION = createRequestTypes("CHECK_TERMS_ACTION")

export const checkTermsAction = {
  request: (data) => ({ type: CHECK_TERMS_ACTION.REQUEST, data }),
  success: (data) => ({ type: CHECK_TERMS_ACTION.SUCCESS, data }),
  error: (error) => ({ type: CHECK_TERMS_ACTION.FAILURE, error }),
}
