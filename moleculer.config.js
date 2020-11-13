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
}
