class UserGenerator {
    constructor(userDataClient) {
        this.userDataClient = userDataClient
    }

    async generateUser(nhsNumber, reference) {
        const user = await this.userDataClient.getUserByNhsNumber(nhsNumber)

        if (user) {
            return user
        }

        return await this.userDataClient.createUser(nhsNumber, reference)
    }
}

module.exports = UserGenerator
