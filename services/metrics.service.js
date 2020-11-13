/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const UserDataClient = require("../clients/user.dataclient")

const pg = require("pg")

const connectionPool = new pg.Pool()

/** @type {ServiceSchema} */
const MetricsService = {
    name: "metricsservice",
    created() {
        this.broker.metrics.register({
            type: "gauge",
            name: "helm.test",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device"],
            description: "This metric is a test",
            unit: "number",
            rate: true, // calculate 1-minute rate
        })

        this.broker.metrics.register({
            type: "gauge",
            name: "helm.newsession",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId"],
            description: "New sessions",
            unit: "number",
        })

        this.broker.metrics.register({
            type: "gauge",
            name: "helm.totalusers",
            labelNames: [],
            description: "Total Users",
            unit: "number",
        })

        this.broker.metrics.register({
            type: "gauge",
            name: "helm.sessionduration",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId"],
            description: "Session duration",
            unit: "number",
        })

        this.broker.metrics.register({
            type: "gauge",
            name: "helm.pageduration",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId", "page"],
            description: "Page duration",
            unit: "number",
        })

        this.broker.metrics.register({
            type: "gauge",
            name: "helm.page",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId", "page"],
            description: "Page",
            unit: "number",
        })

        this.broker.metrics.register({
            type: "gauge",
            name: "helm.bouncedsession",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId"],
            description: "Bounced user sessions",
            unit: "number",
        })

        // this.broker.metrics.register({
        //     type: "gauge",
        //     name: "helm.endsession",
        //     labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId"],
        //     description: "End sessions",
        //     unit: "number",
        // })
    },
    actions: {
        test: {
            async handler(ctx) {
                const { metrics } = ctx.meta

                this.broker.metrics.increment("helm.test", metrics, 1)
            },
        },
        newSession: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId } = ctx.params

                this.broker.metrics.increment("helm.newsession", { ...metrics, userId, sessionId }, 1)
            },
        },
        sessionDuration: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId, duration } = ctx.params

                this.broker.metrics.set("helm.sessionduration", duration, { ...metrics, userId, sessionId })
            },
        },
        bouncedSession: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId } = ctx.params

                this.broker.metrics.increment("helm.bouncedsession", { ...metrics, userId, sessionId }, 1)
            },
        },
        pageDuration: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId, duration, page } = ctx.params

                this.broker.metrics.set("helm.pageduration", duration, { ...metrics, userId, sessionId, page })
            },
        },
        page: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId, page } = ctx.params

                this.broker.metrics.set("helm.page", 1, { ...metrics, userId, sessionId, page })
            },
        },
        // endSession: {
        //     async handler(ctx) {
        //         const { metrics } = ctx.meta
        //         const { userId, sessionId } = ctx.params

        //         this.broker.metrics.decrement("helm.session", { ...metrics, userId, sessionId }, 1)
        //     },
        // },
        updateMetrics: {
            async handler(ctx) {
                const userDataClient = new UserDataClient(connectionPool)

                const userCount = await userDataClient.getUserCount()

                this.broker.metrics.set("helm.totalusers", userCount)
            },
        },
    },
}

module.exports = MetricsService
