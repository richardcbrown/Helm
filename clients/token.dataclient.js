const moment = require("moment")

function mapRowToToken(row) {
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
}

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
            const {
                rows,
            } = await client.query(
                'UPDATE helm."TokenIds" SET "Revoked" = true WHERE "Jti" = $1 RETURNING "Id", "UserId", "Jti", "Issued", "Expires", "Revoked", "CurrentPage", "TotalPages", "PageViewStart", "LastActive"',
                [tokenId]
            )

            const [row] = rows

            if (!row) {
                return null
            }

            return mapRowToToken(row)
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async revokeTokens() {
        const client = await this.connectionPool.connect()

        const nowSeconds = moment(moment.now()).seconds()

        try {
            const {
                rows,
            } = await client.query(
                'UPDATE helm."TokenIds" SET "Revoked" = true WHERE "Revoked" = false AND "Expires" < $1 RETURNING "Id", "UserId", "Jti", "Issued", "Expires", "Revoked", "CurrentPage", "TotalPages", "PageViewStart", "LastActive"',
                [nowSeconds]
            )

            return rows.map(mapRowToToken)
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

    async clearRevokedTokens() {
        const client = await this.connectionPool.connect()

        try {
            await client.query("BEGIN")

            await client.query('DELETE FROM helm."TokenIds" WHERE "Revoked" = true')

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

    async updateTokenActive(jti, active) {
        const client = await this.connectionPool.connect()

        try {
            await client.query("BEGIN")

            await client.query('UPDATE helm."TokenIds" SET "LastActive" = $2 WHERE "Jti" = $1', [jti, active])

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

            return mapRowToToken(row)
        } catch (error) {
            throw error
        } finally {
            client.release()
        }
    }

    async getActiveTokens() {
        const client = await this.connectionPool.connect()

        try {
            const { rows } = await client.query(
                'SELECT "Id", "UserId", "Jti", "Issued", "Expires", "Revoked", "CurrentPage", "TotalPages", "PageViewStart", "LastActive" FROM helm."TokenIds" WHERE "Revoked" = false'
            )

            return mapRowToToken(rows)
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
