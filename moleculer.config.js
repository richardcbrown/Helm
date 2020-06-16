// moleculer.config.js
module.exports = {
    // Enable console logger
    logger: true,
    cacher: {
        type: "Redis",
        options: {
            // Prefix for keys
            prefix: "MOL",
            // set Time-to-live to 30sec.
            ttl: 30,
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
