const moment = require("moment")

class TokenDataClient {
    /**
     *
     * @param {import("pg").Pool} connectionPool
     */
    constructor(connectionPool) {
        this.connectionPool = connectionPool
    }

    async addToken(tokenId, issued, expires) {
        const client = await this.connectionPool.connect()

        try {
            await client.query('INSERT INTO helm."TokenIds" ("Jti", "Issued", "Expires") VALUES ($1, $2, $3)', [
                tokenId,
                issued,
                expires,
            ])
        } finally {
            client.release()
        }
    }

    async revokeToken(tokenId) {
        const client = await this.connectionPool.connect()

        try {
            await client.query('UPDATE helm."TokenIds" SET "Revoked" = true WHERE "Jti" = $1', [tokenId])
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async isRevokedToken(tokenId) {
        const client = await this.connectionPool.connect()

        try {
            const result = await client.query('SELECT "Revoked" FROM helm."TokenIds" WHERE "Jti" = $1', [tokenId])

            const [row] = result.rows

            if (!row) {
                throw Error(`Token jti ${tokenId} does not exist`)
            }

            return row.Revoked
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async clearExpiredTokens() {
        const client = await this.connectionPool.connect()

        const nowSeconds = moment.now() / 1000

        try {
            await client.query("BEGIN")

            await client.query('DELETE FROM helm."TokenIds" WHERE "Expires" < $1', [nowSeconds])

            await client.query("COMMIT")
        } catch (error) {
            await client.query("ROLLBACK")
        } finally {
            client.release()
        }
    }

    async trackSessionPage(currentPage, totalPages, pageViewStart, tokenId) {
        const client = await this.connectionPool.connect()

        try {
            await client.query("BEGIN")

            await client.query(
                'UPDATE helm."TokenIds" SET "CurrentPage" = $1, "TotalPages" = $2, "PageViewStart" = $3 WHERE "Jti" = $4',
                [currentPage, totalPages, pageViewStart, tokenId]
            )

            await client.query("COMMIT")
        } catch (error) {
            await client.query("ROLLBACK")
        } finally {
            client.release()
        }
    }

    async getToken(tokenId) {
        const client = await this.connectionPool.connect()

        try {
            const {
                rows,
            } = await client.query(
                'SELECT "Id", "UserId", "Jti", "Issued", "Expires", "Revoked", "CurrentPage", "TotalPages", "PageViewStart" FROM helm."TokenIds" WHERE "Jti" = $1',
                [tokenId]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return {
                id: row.Id,
                userId: row.UserId,
                jti: row.Jti,
                issued: row.Issued,
                expires: row.Expires,
                revoked: row.Revoked,
                currentPage: row.CurrentPage,
                totalPages: row.TotalPages,
                pageViewStart: row.PageViewStart,
            }
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async linkUserToToken(userId, tokenId) {
        const client = await this.connectionPool.connect()

        try {
            const { rows } = await client.query('SELECT * FROM helm."TokenIds" WHERE "UserId" = $1 AND "Jti" = $2', [
                userId,
                tokenId,
            ])

            const [row] = rows

            if (row) {
                return row
            }

            await client.query("BEGIN")

            await client.query('UPDATE helm."TokenIds" SET "UserId" = $1 WHERE "Jti" = $2', [userId, tokenId])

            await client.query("COMMIT")
        } catch (error) {
            await client.query("ROLLBACK")
        } finally {
            client.release()
        }
    }
}

module.exports = TokenDataClient
