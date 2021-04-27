const amqplib = require("amqplib")

const JobType = {
    RegisterPatientJob: "register_patient_job",
    LookupPatientJob: "lookup_patient_job",
}

class RabbitJobProducer {
    constructor(configuration) {
        this.configuration = configuration
    }

    async addJob(jobType, payload) {
        const queue = await this.getQueue(jobType)

        queue.sendToQueue(jobType, Buffer.from(JSON.stringify(payload)))
    }

    async getQueue(jobType) {
        const queueConnection = await amqplib.connect(this.configuration)

        const channel = await queueConnection.createChannel()

        await channel.assertQueue(jobType)

        return channel
    }
}

class JobProducerProvider {
    constructor(configuration) {
        this.configuration = configuration
    }

    getJobProducer(jobType) {
        switch (jobType) {
            case JobType.RegisterPatientJob:
            case JobType.LookupPatientJob: {
                return new RabbitJobProducer(this.configuration.rabbit)
            }
            default: {
                throw Error(`Job type ${jobType} does not exist`)
            }
        }
    }
}

module.exports = { JobProducerProvider, JobType }
