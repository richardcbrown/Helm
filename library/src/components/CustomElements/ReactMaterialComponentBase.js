import ReactDOM from "react-dom"
import React from "react"
// import retargetEvents from "react-shadow-dom-retarget-events"
import { create } from "jss"
import { createMuiTheme } from "@material-ui/core"
import { ThemeProvider, StylesProvider, jssPreset } from "@material-ui/styles"

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

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#005EB8",
            light: "#0072CE",
            dark: "#003087",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#009639",
            light: "#78BE20",
            dark: "#006747",
        },
        error: {
            main: "#DA291C",
        },
        background: {
            default: "#E8EDEE",
            paper: "#FFFFFF",
        },
    },
})

export class ReactMaterialComponentBase extends HTMLElement {
    constructor() {
        super()

        this.jsxRootComponent = () => <div></div>
    }

    connectedCallback() {
        super.connectedCallback && super.connectedCallback()

        this.shadow = this.attachShadow({ mode: "open" })

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

        ReactDOM.render(
            <StylesProvider sheetsManager={this.sheetsManager} jss={jss}>
                <ThemeProvider theme={theme}>{this.jsxRootComponent()}</ThemeProvider>
            </StylesProvider>,
            this.mountPoint
        )
    }
}
