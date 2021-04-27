class UserGenerator {
    constructor(userDataClient) {
        this.userDataClient = userDataClient
    }

    async generateUser(nhsNumber) {
        const user = await this.userDataClient.getUserByNhsNumber(nhsNumber)

        if (user) {
            return user
        }

        return await this.userDataClient.createUser(nhsNumber)
    }
}

module.exports = UserGenerator
