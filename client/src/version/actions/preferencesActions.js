import { createRequestTypes } from "../../core/actions/functions"

export const GET_PREFERENCES_ACTION = createRequestTypes("GET_PREFERENCES_ACTION")
export const SAVE_PREFERENCES_ACTION = createRequestTypes("SAVE_PREFERENCES_ACTION")

export const getPreferencesAction = {
  request: (data) => ({ type: GET_PREFERENCES_ACTION.REQUEST, data }),
  success: (data) => ({ type: GET_PREFERENCES_ACTION.SUCCESS, data }),
  error: (error) => ({ type: GET_PREFERENCES_ACTION.FAILURE, error }),
}

export const savePreferencesAction = {
  request: (data) => ({ type: SAVE_PREFERENCES_ACTION.REQUEST, data }),
  success: (data) => ({ type: SAVE_PREFERENCES_ACTION.SUCCESS, data }),
  error: (error) => ({ type: SAVE_PREFERENCES_ACTION.FAILURE, error }),
}
