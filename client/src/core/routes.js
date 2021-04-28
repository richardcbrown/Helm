import React from "react"
import { Route } from "react-router-dom"

import PatientSummary from "./pages/PatientSummary"
import Terms from "../version/pages/Terms"
import TopThreeThingsSimpleList from "../version/plugins/TopThreeThings/TopThreeThingsSimpleList"
import Directory from "../version/pages/Directory"
import Settings from "../version/plugins/Settings/Settings"
import Accessibility from "../version/pages/Accessibility"

export default [
  <Route exact path="/summary" component={PatientSummary} />,
  <Route exact path="/top3Things/history" component={TopThreeThingsSimpleList} />,
  <Route path="/leeds-information" component={Directory} />,
  <Route exact path="/terms" component={Terms} noLayout />,
  <Route exact path="/settings" component={Settings} />,
  <Route exact path="/accessibility" component={Accessibility} noLayout />,
]
