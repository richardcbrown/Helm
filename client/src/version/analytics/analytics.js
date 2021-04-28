import { getToken } from "../../core/token"

export default function helmPlugin(userConfig) {
  // return object for analytics to use
  return {
    /* All plugins require a name */
    name: "helm-analytics",
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      ...userConfig,
    },
    initialize: ({ config }) => {
      // load provider script to page
      // fetch("/analytics/initialise", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(config),
      // })
    },
    page: ({ payload }) => {
      // call provider specific page tracking
      fetch("/analytics/page", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      })
    },
    track: ({ payload }) => {
      // call provider specific event tracking
      // fetch("/analytics/track", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // })
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
      // fetch("/analytics/identify", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // })
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third-party
      return true
    },
  }
}
