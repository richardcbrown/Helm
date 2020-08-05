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
}
