import createFhirSynopsisSaga, { createFhirBundleSaga, createFhirResourceSaga } from "./fhirSaga"
import { SYNOPSIS_TOP_THREE_THINGS_ACTION, synopsisTopThreeThingsAction } from "../actions/synopsisActions"
import { GET_FHIR_RESOURCES_ACTION, getFhirResourcesAction } from "../actions/getFhirResourcesAction"
import { CREATE_FHIR_RESOURCE_ACTION, createFhirResourceAction } from "../actions/createFhirResourceAction"

import { acceptTermsSaga } from "./acceptTermsSagas"
import { getTermsSaga } from "./getTermsSagas"
import { checkTermsSaga } from "./checkTermsSagas"
import { topThreeThingsSaga } from "./topThreeThingsSagas"
import { getNhsServicesSaga } from "./nhsServicesSagas"
import { getLeedsServicesSaga } from "./leedsServicesSagas"
import { getLoopServicesSaga } from "./loopSagas"
import { getPreferencesSaga, savePreferencesSaga } from "./preferencesSagas"

/**
 * This componenr returns array of version sagas
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @return {array}
 */
export default [
  createFhirSynopsisSaga(
    SYNOPSIS_TOP_THREE_THINGS_ACTION,
    synopsisTopThreeThingsAction,
    "QuestionnaireResponse",
    "_sort=-authored&_count=1&questionnaire.identifier=https://fhir.myhelm.org/questionnaire-identifier|topThreeThings"
  ),
  createFhirBundleSaga(GET_FHIR_RESOURCES_ACTION, getFhirResourcesAction),
  createFhirResourceSaga(CREATE_FHIR_RESOURCE_ACTION, createFhirResourceAction),
  acceptTermsSaga,
  getTermsSaga,
  checkTermsSaga,
  topThreeThingsSaga,
  getNhsServicesSaga,
  getLeedsServicesSaga,
  getLoopServicesSaga,
  getPreferencesSaga,
  savePreferencesSaga,
]
