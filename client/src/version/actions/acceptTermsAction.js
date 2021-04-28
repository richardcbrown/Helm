import { createRequestTypes } from "../../core/actions/functions"

export const ACCEPT_TERMS_ACTION = createRequestTypes("ACCEPT_TERMS_ACTION")

export const acceptTermsAction = {
  request: (data) => ({ type: ACCEPT_TERMS_ACTION.REQUEST, data }),
  success: (data) => ({ type: ACCEPT_TERMS_ACTION.SUCCESS, data }),
  error: (error) => ({ type: ACCEPT_TERMS_ACTION.FAILURE, error }),
}
