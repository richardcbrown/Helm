"use strict"

// This function will add tracing exporters to moleculer
function tracingExporters() {
    let exporters = []

    if (process.env.ZIPKIN) {
        exporters.push({
            type: "Zipkin",
            options: {
                baseURL: process.env.ZIPKIN,
                interval: 5,
            },
        })
    }

    if (process.env.TRACE_CONSOLE && process.env.TRACE_CONSOLE.toLowerCase() === "true") {
        exporters.push({
            type: "Console",
        })
    }

    return exporters
}

// moleculer.config.js
module.exports = {
    // Enable console logger
    logger: true,
    cacher: {
        type: "Redis",
        options: {
            prefix: "MOL",
            // Turns Redis client monitoring on.
            monitor: false,
            // Redis settings
            redis: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                db: 0,
            },
        },
    },

    metrics: {
        enabled: true,
        // Available built-in reporters: "Console", "CSV", "Event", "Prometheus", "Datadog", "StatsD"
        reporter: [
            {
                type: "Prometheus",
                options: {
                    // HTTP port
                    port: process.env.PROMETHEUS_PORT || 3030,
                    // HTTP URL path
                    path: process.env.PROMETHEUS_PATH || "/metrics",
                    // Default labels which are appended to all metrics labels
                    defaultLabels: (registry) => ({
                        namespace: registry.broker.namespace,
                        nodeID: registry.broker.nodeID,
                    }),
                },
            },
            // {
            //     type: "Console",
            // },
        ],
    },

    // Enable built-in tracing function. More info: https://moleculer.services/docs/0.14/tracing.html
    tracing: {
        enabled: true,
        // Available built-in exporters: "Console", "Datadog", "Event", "EventLegacy", "Jaeger", "Zipkin"
        exporter: tracingExporters(),
    },
}
