const CronJob = require("cron").CronJob

class CronJobManager {
    constructor(jobSpecs) {
        this.jobSpecs = jobSpecs
    }

    process() {
        for (const jobSpec of this.jobSpecs) {
            jobSpec.job = new CronJob(jobSpec.pattern, jobSpec.process)

            jobSpec.job.start()
        }
    }

    stop() {
        this.jobSpecs.forEach((jobSpec) => {
            if (jobSpec.job) {
                jobSpec.job.stop()
            }
        })
    }
}

module.exports = { CronJobManager }
