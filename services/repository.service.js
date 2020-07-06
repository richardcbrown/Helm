/** @typedef {import("./types").Settings} Settings */
/** @typedef {import("moleculer").ServiceSchema<Settings>} ServiceSchema */
/** @typedef {import("moleculer").Service<ServiceSchema>} Service */
/** @typedef {import("moleculer").Context<any, any>} Context */

const getRedisConfig = require("../config/config.redis")
const RedisDataProvider = require("../providers/redis.dataprovider")
const { RepositoryCacheProvider } = require("../providers/respositorycache.provider")
const RepositoryDataProvider = require("../providers/repository.dataprovider")

/**
 * @this {Service}
 * @param {Context} ctx
 * @returns {Promise<any>}
 * */
async function searchRespositoryHandler(ctx) {
    const cacheProvider = new RepositoryCacheProvider(new RedisDataProvider(getRedisConfig()))
    
    const query = ctx.params

    let { query } = args.req

    const currentPage = Number(query.page)

    const queryHash = crypto
        .createHash("md5")
        .update(JSON.stringify({ q: query.q, tags: query.tags, page: currentPage }))
        .digest("hex")

    if (queryCache.$(queryHash).exists) {
        return finished({ results: queryCache.$(queryHash).getDocument(true) })
    }

    query.meta = {}

    if (currentPage > 1) {
        const previousQueryHash = crypto
            .createHash("md5")
            .update(JSON.stringify({ q: query.q, tags: query.tags, page: currentPage - 1 }))
            .digest("hex")

        if (queryCache.$(previousQueryHash).exists) {
            const previousQuery = queryCache.$(previousQueryHash).getDocument(true)

            query.meta = {
                servicePage: previousQuery.servicePage,
                resourcePage: previousQuery.resourcePage,
                serviceIndex: previousQuery.serviceIndex,
                resourceIndex: previousQuery.resourceIndex,
            }
        }
    }

    const repositoryService = new RepositoryService(this.userDefined.serviceConfig)

    const results = await repositoryService.search(query)

    queryCache.$(queryHash).setDocument(results)

    finished({
        results,
    })
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
