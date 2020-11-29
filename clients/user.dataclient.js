class UserDataClient {
    /**
     * @param {import("pg").Pool} connectionPool
     */
    constructor(connectionPool) {
        this.connectionPool = connectionPool
    }

    async getUserByNhsNumber(nhsNumber) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'SELECT "Id", "NhsNumber", "LastLogin", "Reference" FROM helm."Users" WHERE "NhsNumber" = $1',
                [nhsNumber]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                nhsNumber: row.NhsNumber,
                lastLogin: row.LastLogin,
                reference: row.Reference,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async getUserById(userId) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'SELECT "Id", "NhsNumber", "LastLogin", "Reference" FROM helm."Users" WHERE "UserId" = $1',
                [userId]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                nhsNumber: row.NhsNumber,
                lastLogin: row.LastLogin,
                reference: row.Reference,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async createUser(nhsNumber) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'INSERT INTO helm."Users" ("NhsNumber") VALUES($1) RETURNING "Id", "NhsNumber", "LastLogin"',
                [nhsNumber]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                nhsNumber: row.NhsNumber,
                lastLogin: row.LastLogin,
                reference: row.Reference,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async getUserCount() {
        const client = await this.connectionPool.connect()

        try {
            const { rows } = await client.query('SELECT * FROM  helm."Users"')

            return rows.length
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async setLogin(userId, loginDate) {
        const client = await this.connectionPool.connect()

        try {
            await client.query('UPDATE helm."Users" SET "LastLogin" = $2 WHERE "Id" = $1', [userId, loginDate])
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async setPatientReference(userId, reference) {
        const client = await this.connectionPool.connect()

        try {
            await client.query('UPDATE helm."Users" SET "Reference" = $2 WHERE "Id" = $1 AND "Reference" IS NULL', [
                userId,
                reference,
            ])
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async createUserPreferences(userId, preferences) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'INSERT INTO helm."UserPreferences" ("UserId", "Preferences") VALUES ($1, $2) RETURNING "Id", "UserId", "Preferences"',
                [userId, preferences]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                userId: row.UserId,
                preferences: row.Preferences,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async updateUserPreferences(userId, preferences) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'UPDATE helm."UserPreferences" SET "Preferences" = $2 WHERE "UserId" = $1 RETURNING "Id", "UserId", "Preferences"',
                [userId, preferences]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                userId: row.UserId,
                preferences: row.Preferences,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async getUserPreferences(userId) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'SELECT "Id", "UserId", "Preferences" FROM helm."UserPreferences" WHERE "UserId" = $1',
                [userId]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                userId: row.UserId,
                preferences: row.Preferences,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }
}

module.exports = UserDataClient
