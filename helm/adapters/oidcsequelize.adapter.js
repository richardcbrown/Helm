/*
 * This is a very rough-edged example, the idea is to still work with the fact that oidc-provider
 * has a rather "dynamic" schema. This example uses sequelize with postgresql, and all dynamic data
 * uses JSON fields. id is set to be the primary key, grantId should be additionaly indexed for
 * models where these fields are set (grantId-able models). userCode should be additionaly indexed
 * for DeviceCode model. uid should be additionaly indexed for Session model. For sequelize
 * migrations @see https://github.com/Rogger794/node-oidc-provider/tree/examples/example/migrations/sequelize
 */

/** @todo pg implmentation */
const Sequelize = require("sequelize")

/**
 *
 * @param {import("../config/types").DatabaseConfiguration} configuration
 */
function getAdapter(configuration) {
    const sequelize = new Sequelize(configuration.database, configuration.user, configuration.password, {
        host: configuration.host,
        port: configuration.port,
        dialect: "postgres",
    })

    const grantable = new Set(["AccessToken", "AuthorizationCode", "RefreshToken", "DeviceCode"])

    const models = [
        "Session",
        "AccessToken",
        "AuthorizationCode",
        "RefreshToken",
        "DeviceCode",
        "ClientCredentials",
        "Client",
        "InitialAccessToken",
        "RegistrationAccessToken",
        "Interaction",
        "ReplayDetection",
        "PushedAuthorizationRequest",
    ].reduce((map, name) => {
        map.set(
            name,
            sequelize
                .define(
                    name,
                    {
                        Id: { type: Sequelize.STRING, primaryKey: true },
                        ...(grantable.has(name) ? { GrantId: { type: Sequelize.STRING } } : undefined),
                        ...(name === "DeviceCode" ? { UserCode: { type: Sequelize.STRING } } : undefined),
                        ...(name === "Session" ? { Uid: { type: Sequelize.STRING } } : undefined),
                        Data: { type: Sequelize.JSONB },
                        ExpiresAt: { type: Sequelize.DATE },
                        ConsumedAt: { type: Sequelize.DATE },
                    },
                    {
                        timestamps: false,
                        freezeTableName: true,
                    }
                )
                .schema(configuration.schema)
        )

        return map
    }, new Map())

    return class OidcSequelizeAdapter {
        constructor(name) {
            this.model = models.get(name)
            this.name = name
        }

        async upsert(id, data, expiresIn) {
            await this.model.upsert({
                Id: id,
                Data: data,
                ...(data.grantId ? { GrantId: data.grantId } : undefined),
                ...(data.userCode ? { UserCode: data.userCode } : undefined),
                ...(data.uid ? { Uid: data.uid } : undefined),
                ...(expiresIn ? { ExpiresAt: new Date(Date.now() + expiresIn * 1000) } : undefined),
            })
        }

        async find(id) {
            const found = await this.model.findByPk(id)
            if (!found) return undefined
            return {
                ...found.Data,
                ...(found.ConsumedAt ? { consumed: true } : undefined),
            }
        }

        async findByUserCode(userCode) {
            const found = await this.model.findOne({ where: { userCode } })
            if (!found) return undefined
            return {
                ...found.Data,
                ...(found.ConsumedAt ? { consumed: true } : undefined),
            }
        }

        async findByUid(uid) {
            const found = await this.model.findOne({ where: { Uid: uid } })
            if (!found) return undefined
            return {
                ...found.Data,
                ...(found.ConsumedAt ? { consumed: true } : undefined),
            }
        }

        async destroy(id) {
            await this.model.destroy({ where: { Id: id } })
        }

        async consume(id) {
            await this.model.update({ consumedAt: new Date() }, { where: { Id: id } })
        }

        async revokeByGrantId(grantId) {
            await this.model.destroy({ where: { GrantId: grantId } })
        }

        static async connect() {
            return sequelize.sync()
        }
    }
}

module.exports = getAdapter
