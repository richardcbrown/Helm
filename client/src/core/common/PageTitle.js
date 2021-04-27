import React, { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { connect } from "react-redux"
import { setAccessibilityMessage } from "../actions/accessibilityActions"

const titles = {
  "/": { title: "Home" },
  "/summary": { title: "Summary" },
  "/top3things": { title: "Top Three Things" },
  "/top3things/history": { title: "Top Three Things - History" },
  "/leeds-information": { title: "Leeds Information" },
  "/terms": { title: "Terms and Conditions" },
  "/settings": { title: "Settings" },
  "/nhs-resources": { title: "NHS Resources" },
  "/accessibility": { title: "Accessibility" },
}

const PageTitle = (props) => {
  const location = useLocation()

  const { setAccessibilityMessage } = props

  useEffect(() => {
    let hash = location.pathname

    hash = hash.toLocaleLowerCase()

    const title = titles[hash] ? `Helm - ${titles[hash].title}` : "Helm"

    document.title = title

    setAccessibilityMessage(`Navigated to ${title}`)
  }, [])

  return <>{props.children}</>
}

const mapDispatchToProps = (dispatch) => {
  return {
    setAccessibilityMessage: (message) => dispatch(setAccessibilityMessage(message)),
  }
}

const ConnectedPageTitle = connect(null, mapDispatchToProps)(PageTitle)

export { ConnectedPageTitle as PageTitle }
