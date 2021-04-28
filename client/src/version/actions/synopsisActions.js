import { createRequestTypes } from "../../core/actions/functions"

export const SYNOPSIS_TOP_THREE_THINGS_ACTION = createRequestTypes("SYNOPSIS_TOP_THREE_THINGS_ACTION")
export const SYNOPSIS_VACCINATIONS_ACTION = createRequestTypes("SYNOPSIS_VACCINATIONS_ACTION")
export const SYNOPSIS_NHSSERVICES_ACTION = createRequestTypes("SYNOPSIS_NHSSERVICES_ACTION")
export const SYNOPSIS_LEEDSSERVICES_ACTION = createRequestTypes("SYNOPSIS_LEEDSSERVICES_ACTION")
export const SYNOPSIS_LOOPSERVICES_ACTION = createRequestTypes("SYNOPSIS_LOOPSERVICES_ACTION")

export const synopsisLeedsServicesAction = {
  request: (data) => ({ type: SYNOPSIS_LEEDSSERVICES_ACTION.REQUEST, data }),
  success: (data) => ({ type: SYNOPSIS_LEEDSSERVICES_ACTION.SUCCESS, data }),
  error: (error) => ({ type: SYNOPSIS_LEEDSSERVICES_ACTION.FAILURE, error }),
}

export const synopsisNhsServicesAction = {
  request: (data) => ({ type: SYNOPSIS_NHSSERVICES_ACTION.REQUEST, data }),
  success: (data) => ({ type: SYNOPSIS_NHSSERVICES_ACTION.SUCCESS, data }),
  error: (error) => ({ type: SYNOPSIS_NHSSERVICES_ACTION.FAILURE, error }),
}

export const synopsisLoopServicesAction = {
  request: (data) => ({ type: SYNOPSIS_LOOPSERVICES_ACTION.REQUEST, data }),
  success: (data) => ({ type: SYNOPSIS_LOOPSERVICES_ACTION.SUCCESS, data }),
  error: (error) => ({ type: SYNOPSIS_LOOPSERVICES_ACTION.FAILURE, error }),
}

export const synopsisTopThreeThingsAction = {
  request: (data) => ({ type: SYNOPSIS_TOP_THREE_THINGS_ACTION.REQUEST, data }),
  success: (data) => ({ type: SYNOPSIS_TOP_THREE_THINGS_ACTION.SUCCESS, data }),
  error: (error) => ({ type: SYNOPSIS_TOP_THREE_THINGS_ACTION.FAILURE, error }),
}

export const synopsisVaccinationsAction = {
  request: (data) => ({ type: SYNOPSIS_VACCINATIONS_ACTION.REQUEST, data }),
  success: (data) => ({ type: SYNOPSIS_VACCINATIONS_ACTION.SUCCESS, data }),
  error: (error) => ({ type: SYNOPSIS_VACCINATIONS_ACTION.FAILURE, error }),
}
