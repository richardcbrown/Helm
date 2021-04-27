import terms from "./termsReducer"
import {
  SYNOPSIS_TOP_THREE_THINGS_ACTION,
  SYNOPSIS_VACCINATIONS_ACTION,
  SYNOPSIS_NHSSERVICES_ACTION,
  SYNOPSIS_LEEDSSERVICES_ACTION,
  SYNOPSIS_LOOPSERVICES_ACTION,
} from "../actions/synopsisActions"

import createCustomReducer from "../../core/reducers/createCustomReducer"
import fhirReducer, { createFhirResourceReducer } from "./fhirReducer"
import preferencesReducer from "./preferencesReducer"

/**
 * This component returns version reducers
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @return {shape}
 */
export default {
  vaccinationsSynopsis: createCustomReducer(SYNOPSIS_VACCINATIONS_ACTION, "data.synopsis"),
  top3ThingsSynopsis: createCustomReducer(SYNOPSIS_TOP_THREE_THINGS_ACTION, "data.synopsis"),
  "nhs-resourcesSynopsis": createCustomReducer(SYNOPSIS_NHSSERVICES_ACTION, "data.synopsis"),
  "health-and-adviceSynopsis": createCustomReducer(SYNOPSIS_LEEDSSERVICES_ACTION, "data.synopsis"),
  "leeds-informationSynopsis": createCustomReducer(SYNOPSIS_LOOPSERVICES_ACTION, "data.synopsis"),
  terms,
  fhir: fhirReducer,
  createFhirResource: createFhirResourceReducer,
  preferences: preferencesReducer,
}
