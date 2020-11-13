const { Logging } = require("@google-cloud/logging")

class LoggingClient {
    constructor(logName) {
        this.logName = logName

        this.logging = new Logging({ projectId: process.env.GCP_PROJECT_ID })

        this.log = this.logging.log(this.logName)
    }

    logEntry() {
        const entry = this.log.entry({ resource: { type: "global" }, severity: "INFO" }, { test: "Test", item: 1 })

        this.log.write(entry)
    }
}

module.exports = LoggingClient
