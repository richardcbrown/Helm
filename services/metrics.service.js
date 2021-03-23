/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const UserDataClient = require("../clients/user.dataclient")
const getDatabaseConfiguration = require("../config/config.database")

const pg = require("pg")

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
            name: "helm.activeusers",
            labelNames: [],
            description: "Active Users",
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
            name: "helm.lastloginduration",
            labelNames: ["country", "userAgent", "browser", "ip", "os", "device", "userId", "sessionId"],
            description: "Last login duration",
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
    },
    actions: {
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
        lastLoginDuration: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId, duration } = ctx.params

                this.broker.metrics.set("helm.lastloginduration", duration, { ...metrics, userId, sessionId })
            },
        },
        page: {
            async handler(ctx) {
                const { metrics } = ctx.meta
                const { userId, sessionId, page } = ctx.params

                this.broker.metrics.set("helm.page", 1, { ...metrics, userId, sessionId, page })
            },
        },
        updateMetrics: {
            async handler(ctx) {
                const userDataClient = new UserDataClient(this.connectionPool)

                const userCount = await userDataClient.getUserCount()

                this.broker.metrics.set("helm.totalusers", userCount)
            },
        },
        activeUsers: {
            handler(ctx) {
                const { activeUsers } = ctx.params

                this.broker.metrics.set("helm.activeusers", activeUsers)
            },
        },
    },
    async started() {
        try {
            const config = await getDatabaseConfiguration()

            this.connectionPool = new pg.Pool(config)
        } catch (error) {
            this.logger.error(error.stack || error.message)
            throw error
        }
    },
}

module.exports = MetricsService
