import React, { useEffect, useRef, useState } from "react"
import get from "lodash/get"
import { Admin, Resource } from "react-admin"

import customDataProvider from "./dataProviders/dataProvider"
import authProvider from "./dataProviders/authProvider"

import corePlugins from "./config/corePlugins"
import nonCorePlugins from "../version/config/nonCorePlugins"

import customSagas from "./sagas"
import customReducers from "./reducers"
import customRoutes from "./routes"

import Layout from "./common/CustomLayout"
import InitializePage from "./pages/InitializePage"
import { themeCommonElements } from "../version/config/theme.config"
import translations from "./translations"
import { makeStyles } from "@material-ui/core"

import { createHashHistory } from "history"
import { Provider, connect } from "react-redux"
import createStore from "./Store"

import "../styles/theme.css"
import "../styles/light.css"
import "../styles/dark.css"

const plugins = corePlugins.concat(nonCorePlugins)
const Homepage = get(themeCommonElements, "homePage")
const i18nProvider = {
  getLocale: () => "en",
  translate: (key, options) => {
    return get(translations, `en.${key}`)
  },
}

const useStyles = makeStyles((theme) => ({
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    border: 0,
  },
}))

const AccessibilityNotice = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState("")

  const classes = useStyles()

  useEffect(() => {
    setTimeout(() => setCurrentMessage(message), 100)
  }, [message])

  useEffect(() => {
    setTimeout(() => setCurrentMessage(""), 1000)
  }, [currentMessage])

  return (
    <div className={classes.srOnly} role="status" aria-live="polite" aria-atomic="true">
      {currentMessage ? <span>{currentMessage}</span> : ""}
    </div>
  )
}

const mapStateToProps = (state) => {
  const message = get(state, "custom.accessibility.message", null)
  return {
    message,
  }
}

const ConnectedAccessibilityNotice = connect(mapStateToProps, null)(AccessibilityNotice)

const history = createHashHistory()

const StyleLoader = ({ contrastMode }) => {
    const theme = useRef(new CSSStyleSheet())
    
    useEffect(() => {
        const themeStyles = document.getElementById("theme")

        const additionalStyles = contrastMode ? document.getElementById("dark") : document.getElementById("light")

        theme.current.replaceSync(`${themeStyles.innerHTML} ${additionalStyles.innerHTML}`)

        document.adoptedStyleSheets = [theme.current]
    }, [])

    useEffect(() => {
        const themeStyles = document.getElementById("theme")

        const additionalStyles = contrastMode ? document.getElementById("dark") : document.getElementById("light")

        theme.current.replaceSync(`${themeStyles.innerHTML} ${additionalStyles.innerHTML}`)
    }, [contrastMode])

    return null
}

const mapStyleStateToProps = (state) => {
    const preferences = get(state, "custom.preferences", {})
  
    const userPrefs = (preferences && preferences.data && preferences.data.preferences) || {}
  
    const contrastMode = get(userPrefs, "general.preferences.contrastMode", false)
  
    return {
      contrastMode: contrastMode,
    }
  }

const ConnectedStyleLoader = connect(mapStyleStateToProps)(StyleLoader)

const App = () => {
  return (
    <Provider
      store={createStore({
        authProvider,
        dataProvider: customDataProvider,
        history,
        customSagas: [customSagas],
        customReducers: { custom: customReducers },
      })}
    >
      <ConnectedStyleLoader />
      <ConnectedAccessibilityNotice />
      <Admin
        history={history}
        authProvider={authProvider}
        customRoutes={customRoutes}
        dataProvider={customDataProvider}
        dashboard={Homepage}
        appLayout={Layout}
        loginPage={InitializePage}
        locale="en"
        i18nProvider={i18nProvider}
      >
        {plugins.map((item) => {
          const resourceProps = {}

          if (item.create) {
            resourceProps.create = item.create
          }

          if (item.edit) {
            resourceProps.edit = item.edit
          }

          return <Resource name={item.name} options={{ label: item.label }} list={item.list} {...resourceProps} />
        })}
      </Admin>
    </Provider>
  )
}

export default App
