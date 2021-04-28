import { all } from "redux-saga/effects"

// CORE SAGAS
import initializeSagas from "./initializeSagas"
import demographicsSagas from "./demographicsSagas"
import httpErrorSagas from "./httpErrorSagas"

// LINK TO NON-CORE SAGAS
import nonCoreSagas from "../../version/sagas"

const coreSagas = [initializeSagas, demographicsSagas, httpErrorSagas]

const mergeSagas = coreSagas.concat(nonCoreSagas)

export default function* rootSaga() {
  yield all(mergeSagas)
}
