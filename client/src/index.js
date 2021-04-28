import "react-app-polyfill/ie11"
import "react-app-polyfill/stable"

import React from "react"
import ReactDOM from "react-dom"
import App from "./core/App"

import Analytics from "analytics"
import helmAnalytics from "./version/analytics/analytics"

const analytics = Analytics({
  app: "helm",
  plugins: [helmAnalytics({})],
})

window.analytics = analytics

ReactDOM.render(<App />, document.getElementById("root"))
