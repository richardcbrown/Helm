import ReactDOM from "react-dom"
import React from "react"
// import retargetEvents from "react-shadow-dom-retarget-events"
import { create } from "jss"
import { createMuiTheme } from "@material-ui/core"
import { ThemeProvider, StylesProvider, jssPreset } from "@material-ui/styles"
import { ShadowContext } from "../React/Context/ShadowContext"
import { getCurrentTheme } from "./Styles"

var hasSymbol = typeof Symbol === "function" && Symbol.for

var _nested = hasSymbol ? Symbol.for("mui.nested") : "__THEME_NESTED__"

/**
 * This is the list of the style rule name we use as drop in replacement for the built-in
 * pseudo classes (:checked, :disabled, :focused, etc.).
 *
 * Why do they exist in the first place?
 * These classes are used at a specificity of 2.
 * It allows them to override previously definied styles as well as
 * being untouched by simple user overrides.
 */
var pseudoClasses = ["checked", "disabled", "error", "focused", "focusVisible", "required", "expanded", "selected"] // Returns a function which generates unique class names based on counters.
// When new generator function is created, rule counter is reset.
// We need to reset the rule counter for SSR for each request.
//
// It's inspired by
// https://github.com/cssinjs/jss/blob/4e6a05dd3f7b6572fdd3ab216861d9e446c20331/src/utils/createGenerateClassName.js

function createGenerateClassName() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    var _options$disableGloba = options.disableGlobal,
        disableGlobal = _options$disableGloba === void 0 ? false : _options$disableGloba,
        _options$productionPr = options.productionPrefix,
        productionPrefix = _options$productionPr === void 0 ? "jss" : _options$productionPr,
        _options$seed = options.seed,
        seed = _options$seed === void 0 ? "" : _options$seed
    var seedPrefix = seed === "" ? "" : "".concat(seed, "-")
    var ruleCounter = 0

    return function (rule, styleSheet) {
        var name = styleSheet.options.name // Is a global static MUI style?

        if (name && name.indexOf("Mui") === 0 && !styleSheet.options.link && !disableGlobal) {
            // We can use a shorthand class name, we never use the keys to style the components.
            if (pseudoClasses.indexOf(rule.key) !== -1) {
                return "Mui-".concat(rule.key)
            }

            var prefix = "".concat(seedPrefix).concat(name, "-").concat(rule.key)

            if (!styleSheet.options.theme[_nested] || seed !== "") {
                return prefix
            }

            return "".concat(prefix)
        }

        if (process.env.NODE_ENV === "production") {
            return "".concat(seedPrefix).concat(productionPrefix)
        }

        var suffix = "".concat(rule.key) // Help with debuggability.

        if (styleSheet.options.classNamePrefix) {
            return "".concat(seedPrefix).concat(styleSheet.options.classNamePrefix).concat(suffix)
        }

        return "".concat(seedPrefix).concat(suffix)
    }
}

var reactEvents = [
    "onAbort",
    "onAnimationCancel",
    "onAnimationEnd",
    "onAnimationIteration",
    "onAuxClick",
    "onBlur",
    "onChange",
    "onClick",
    "onClose",
    "onContextMenu",
    "onDoubleClick",
    "onError",
    "onFocus",
    "onGotPointerCapture",
    "onInput",
    "onKeyDown",
    "onKeyPress",
    "onKeyUp",
    "onLoad",
    "onLoadEnd",
    "onLoadStart",
    "onLostPointerCapture",
    "onMouseDown",
    "onMouseMove",
    "onMouseOut",
    "onMouseOver",
    "onMouseUp",
    "onPointerCancel",
    "onPointerDown",
    "onPointerEnter",
    "onPointerLeave",
    "onPointerMove",
    "onPointerOut",
    "onPointerOver",
    "onPointerUp",
    "onReset",
    "onResize",
    "onScroll",
    "onSelect",
    "onSelectionChange",
    "onSelectStart",
    "onSubmit",
    "onTouchCancel",
    "onTouchMove",
    "onTouchStart",
    "onTouchEnd",
    "onTransitionCancel",
    "onTransitionEnd",
    "onDrag",
    "onDragEnd",
    "onDragEnter",
    "onDragExit",
    "onDragLeave",
    "onDragOver",
    "onDragStart",
    "onDrop",
    "onFocusOut",
]

var divergentNativeEvents = {
    onDoubleClick: "dblclick",
}

var mimickedReactEvents = {
    onInput: "onChange",
    onFocusOut: "onBlur",
    onSelectionChange: "onSelect",
}

function retargetEvents(shadowRoot) {
    var removeEventListeners = []

    reactEvents.forEach(function (reactEventName) {
        var nativeEventName = getNativeEventName(reactEventName)

        function retargetEvent(event) {
            var path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target)

            for (var i = 0; i < path.length; i++) {
                var el = path[i]
                var props = null
                var reactComponent = findReactComponent(el)
                var eventHandlers = findReactEventHandlers(el)

                if (!eventHandlers) {
                    props = findReactProps(reactComponent)
                } else {
                    props = eventHandlers
                }

                if (reactComponent && props) {
                    dispatchEvent(event, reactEventName, props)
                }

                if (reactComponent && props && mimickedReactEvents[reactEventName]) {
                    dispatchEvent(event, mimickedReactEvents[reactEventName], props)
                }

                if (event.cancelBubble) {
                    break
                }

                if (el === shadowRoot) {
                    break
                }
            }
        }

        shadowRoot.addEventListener(nativeEventName, retargetEvent, false)

        removeEventListeners.push(function () {
            shadowRoot.removeEventListener(nativeEventName, retargetEvent, false)
        })
    })

    return function () {
        removeEventListeners.forEach(function (removeEventListener) {
            removeEventListener()
        })
    }
}

function findReactEventHandlers(item) {
    return findReactProperty(item, "__reactEventHandlers")
}

function findReactComponent(item) {
    return findReactProperty(item, "_reactInternal")
}

function findReactProperty(item, propertyPrefix) {
    for (var key in item) {
        if (item.hasOwnProperty(key) && key.indexOf(propertyPrefix) !== -1) {
            return item[key]
        }
    }
}

function findReactProps(component) {
    if (!component) return undefined
    if (component.memoizedProps) return component.memoizedProps // React 16 Fiber
    if (component._currentElement && component._currentElement.props) return component._currentElement.props // React <=15
}

function dispatchEvent(event, eventType, componentProps) {
    event.persist = function () {
        event.isPersistent = function () {
            return true
        }
    }

    if (componentProps[eventType]) {
        componentProps[eventType](event)
    }
}

function getNativeEventName(reactEventName) {
    if (divergentNativeEvents[reactEventName]) {
        return divergentNativeEvents[reactEventName]
    }
    return reactEventName.replace(/^on/, "").toLowerCase()
}

function composedPath(el) {
    var path = []
    while (el) {
        path.push(el)
        if (el.tagName === "HTML") {
            path.push(document)
            path.push(window)
            return path
        }
        el = el.parentElement
    }
}

export class ReactMaterialComponentBase extends HTMLElement {
    constructor() {
        super()

        this.jsxRootComponent = () => <div></div>
    }

    connectedCallback() {
        super.connectedCallback && super.connectedCallback()

        this.shadow = this.shadow || this.attachShadow({ mode: "open" })

        this.mountPoint = document.createElement("div")

        this.stylesMountPoint = document.createElement("div")

        this.shadow.appendChild(this.stylesMountPoint)
        this.shadow.appendChild(this.mountPoint)

        this.sheetsManager = new Map()

        retargetEvents(this.shadow)

        this.render()
    }

    render() {
        const jss = create({
            ...jssPreset(),
            insertionPoint: this.stylesMountPoint,
        })

        const { shadow } = this

        ReactDOM.render(
            <ShadowContext.Provider value={{ shadowRoot: shadow }}>
                <StylesProvider
                    generateClassName={createGenerateClassName()}
                    sheetsManager={this.sheetsManager}
                    jss={jss}
                >
                    <ThemeProvider theme={getCurrentTheme(shadow.querySelectorAll("div")[0])}>{this.jsxRootComponent()}</ThemeProvider>
                </StylesProvider>
            </ShadowContext.Provider>,
            this.mountPoint
        )
    }
}
