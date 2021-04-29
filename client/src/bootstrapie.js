import "whatwg-fetch"
import "core-js/stable"
import "systemjs/dist/system.js"
import "regenerator-runtime/runtime"
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js"

if (Element.prototype.getAttributeNames == undefined) {
  Element.prototype.getAttributeNames = function () {
    const attributes = this.attributes
    const length = attributes.length
    const result = new Array(length)
    for (let i = 0; i < length; i++) {
      result[i] = attributes[i].name
    }
    return result
  }
}

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach
}

const script = document.createElement("script")
script.src = "./importmapie.json"
script.type = "systemjs-importmap"
document.head.appendChild(script)

// const script2 = document.createElement("script")
// script2.src = "https://cdn.jsdelivr.net/npm/systemjs/dist/system.js"
// script2.onload = function () {
//   window.System.import("synrb-canvas-library")
//   window.System.import("app")
// }
//document.head.appendChild(script2)

window.System.import("synrb-canvas-library")
window.System.import("app")
