import "systemjs/dist/system.js"
import "regenerator-runtime/runtime"

const script = document.createElement("script")
script.src = "./importmap.json"
script.type = "systemjs-importmap"
document.head.append(script)

window.System.import("react")
window.System.import("synrb-canvas-library")
window.System.import("app")
