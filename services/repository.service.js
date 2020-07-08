/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const getRedisConfig = require("../config/config.redis")
const RedisDataProvider = require("../providers/redis.dataprovider")
const { RepositoryCacheProvider } = require("../providers/respositorycache.provider")
const RepositoryDataProvider = require("../providers/repository.dataprovider")
const getRepositoryConfig = require("../config/config.repository")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function searchRespositoryHandler(ctx) {
    const cacheProvider = new RepositoryCacheProvider(new RedisDataProvider(getRedisConfig()))

    const query = ctx.params

    const cachedQueryResult = await cacheProvider.getRepositoryData(query)

    if (cachedQueryResult) {
        return cachedQueryResult
    }

    query.meta = {}

    const currentPage = Number(query.page)

    if (currentPage > 1) {
        const previousQuery = await cacheProvider.getRepositoryData({ ...query, page: currentPage - 1 })

        if (previousQuery) {
            query.meta = {
                servicePage: previousQuery.servicePage,
                resourcePage: previousQuery.resourcePage,
                serviceIndex: previousQuery.serviceIndex,
                resourceIndex: previousQuery.resourceIndex,
            }
        }
    }

    const repositoryProvider = new RepositoryDataProvider(getRepositoryConfig())

    const results = await repositoryProvider.search(query)

    await cacheProvider.setRepositoryData(query, results)

    return results
}

/** @type {ServiceSchema} */
const RepositoryService = {
    name: "repositoryservice",
    actions: {
        search: {
            role: "phrUser",
            handler: searchRespositoryHandler,
        },
    },
    hooks: {
        before: {
            "*": [
                (ctx) => {
                    if (ctx.meta.user.role !== ctx.action.role) {
                        throw Error("User does not have the required role")
                    }
                },
            ],
        },
    },
}

module.exports = RepositoryService
