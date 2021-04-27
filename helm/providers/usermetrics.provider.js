const path = require("path")
const requestIp = require("request-ip")
const { browserName, detectOS } = require("detect-browser")
const isLocalhost = require("is-localhost-ip")
const maxmind = require("maxmind")

const DESKTOP_SCREEN_WIDTH = 1920
const LAPTOP_SCREEN_WIDTH = 1024
const MOBILE_SCREEN_WIDTH = 479

const DESKTOP_OS = [
    "Windows 3.11",
    "Windows 95",
    "Windows 98",
    "Windows 2000",
    "Windows XP",
    "Windows Server 2003",
    "Windows Vista",
    "Windows 7",
    "Windows 8",
    "Windows 8.1",
    "Windows 10",
    "Windows ME",
    "Open BSD",
    "Sun OS",
    "Linux",
    "Mac OS",
    "QNX",
    "BeOS",
    "OS/2",
    "Chrome OS",
]

const MOBILE_OS = ["iOS", "Android OS", "BlackBerry OS", "Windows Mobile", "Amazon OS"]

const BROWSERS = {
    aol: "AOL",
    edge: "Edge",
    "edge-ios": "Edge (iOS)",
    yandexbrowser: "Yandex",
    kakaotalk: "KKaoTalk",
    samsung: "Samsung",
    silk: "Silk",
    miui: "MIUI",
    beaker: "Beaker",
    "edge-chromium": "Edge (Chromium)",
    chrome: "Chrome",
    "chromium-webview": "Chrome (webview)",
    phantomjs: "PhantomJS",
    crios: "Chrome (iOS)",
    firefox: "Firefox",
    fxios: "Firefox (iOS)",
    "opera-mini": "Opera Mini",
    opera: "Opera",
    ie: "IE",
    bb10: "BlackBerry 10",
    android: "Android",
    ios: "iOS",
    safari: "Safari",
    facebook: "Facebook",
    instagram: "Instagram",
    "ios-webview": "iOS (webview)",
    searchbot: "Searchbot",
}

function getIpAddress(req) {
    // Cloudflare
    if (req.headers["cf-connecting-ip"]) {
        return req.headers["cf-connecting-ip"]
    }

    return requestIp.getClientIp(req)
}

function getDevice(screen, browser, os) {
    if (!screen) return

    const [width] = screen.split("x")

    if (DESKTOP_OS.includes(os)) {
        if (os === "Chrome OS" || width < DESKTOP_SCREEN_WIDTH) {
            return "laptop"
        }
        return "desktop"
    } else if (MOBILE_OS.includes(os)) {
        if (os === "Amazon OS" || width > MOBILE_SCREEN_WIDTH) {
            return "tablet"
        }
        return "mobile"
    }

    if (width >= DESKTOP_SCREEN_WIDTH) {
        return "desktop"
    } else if (width >= LAPTOP_SCREEN_WIDTH) {
        return "laptop"
    } else if (width >= MOBILE_SCREEN_WIDTH) {
        return "tablet"
    } else {
        return "mobile"
    }
}

async function getCountry(req, ip) {
    // Cloudflare
    if (req.headers["cf-ipcountry"]) {
        return req.headers["cf-ipcountry"]
    }

    // Ignore local ips
    if (await isLocalhost(ip)) {
        return
    }

    // Database lookup
    const lookup = await maxmind.open(path.resolve("./assets/geo/GeoLite2-Country.mmdb"))

    const result = lookup.get(ip)

    return result.country.iso_code
}

class UserMetricsProvider {
    async getUserLocationDetails(req, payload = {}) {
        const { screen } = payload

        const userAgent = req.headers["user-agent"]
        const ip = getIpAddress(req)
        const country = await getCountry(req, ip)
        const browser = browserName(userAgent)
        const os = detectOS(userAgent)
        const device = getDevice(screen, browser, os)

        return { userAgent, browser, os, ip, country, device }
    }
}

module.exports = UserMetricsProvider
