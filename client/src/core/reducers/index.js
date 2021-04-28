import { combineReducers } from "redux"

import showHeadings from "./showHeadingsReducer"
import createCustomReducer from "./createCustomReducer"
import httpErrorReducer from "./httpErrorReducer"

import { INITIALIZE_ACTION } from "../actions/initializeAction"
import { DEMOGRAPHICS_ACTION } from "../actions/demographicsAction"

// LINK TO NON-CORE CUSTOM REDUCERS
import nonCoreReducers from "../../version/reducers"
import accessibilityReducer from "./accessibilityReducer"

const coreReducers = {
  initialize: createCustomReducer(INITIALIZE_ACTION, "data"),
  demographics: createCustomReducer(DEMOGRAPHICS_ACTION, "data.demographics"),
  httpErrors: httpErrorReducer,
  showHeadings,
  accessibility: accessibilityReducer,
}

const reducers = Object.assign({}, coreReducers, nonCoreReducers)

export default combineReducers(reducers)
