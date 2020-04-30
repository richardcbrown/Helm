/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | http://www.synanetics.com                                                |
 | Email: support@synanetics.com                                            |
 |                                                                          |
 | Author: Richard Brown                                                    |
 |                                                                          |
 ----------------------------------------------------------------------------

*/

"use strict"

const winston = require("winston")
require("winston-daily-rotate-file")

var errorTransport = new winston.transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "2d",
    createSymlink: true,
    symlinkName: "error.log",
})

/**
 * @todo log level
 * @param {string} serviceName - the name of service
 */
function buildLogger(serviceName) {
    const logger = winston.createLogger({
        level: "error",
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: { service: serviceName },
        transports: [errorTransport],
    })

    // Call exceptions.handle with a transport to handle exceptions
    logger.exceptions.handle(errorTransport)

    return logger
}

module.exports = { buildLogger }
