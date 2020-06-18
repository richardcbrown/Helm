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
                host: "localhost",
                port: 6379,
                db: 0,
            },
        },
    },
}
