const request = require("request-promise-native")

const youtubeResourceFormatter = (resource) => {
    const { url } = resource

    const youtubePattern = "^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$"

    function getId(url) {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
        var match = url.match(regExp)

        if (match && match[2].length == 11) {
            return match[2]
        } else {
            return
        }
    }

    if (url.match(youtubePattern)) {
        const youtubeId = getId(url)

        resource.tileType = "youtube"
        resource.embeddedLink = `https://www.youtube.com/embed/${youtubeId}`
    }

    return resource
}

class RepositoryDataProvider {
    constructor(configuration) {
        this.configuration = configuration
    }

    /**
     * @private
     */
    formatResource(resource) {
        return youtubeResourceFormatter(resource)
    }

    /**
     * @private
     */
    formatResources(resultSet) {
        if (resultSet && resultSet.data) {
            resultSet.data = resultSet.data.map(this.formatResource)
        }

        return resultSet
    }

    /**
     * @private
     */
    skipToIndex(pageIndex, resources) {
        const index = resources.findIndex((res) => res.id === pageIndex)

        if (index === -1) {
            return resources
        }

        return resources.slice(index)
    }

    /**
     * @private
     */
    async searchResourcesMatchingAllTags(search, query, pageSize) {
        const { tags } = query
        const { meta } = query

        let page = meta.currentPage || 1
        const pageIndex = meta.currentIndex

        const tagIds = tags.split(",").filter((t) => !!t)

        const firstTag = tagIds[0] ? [tagIds[0]] : null

        let matchingResources = []

        const response = await search({ ...query, tags: firstTag, page, perPage: 100 })

        const resources = pageIndex ? this.skipToIndex(pageIndex, response.data) : response.data

        matchingResources = matchingResources.concat(
            resources.filter((service) => this.containsAllTags(service.category_taxonomies, tagIds))
        )

        // run out of services
        if (response.data.length >= 100) {
            while (matchingResources.length < pageSize) {
                if (page >= 5) {
                    break
                }

                const response = await search({ ...query, tags: firstTag, page, perPage: 100 })

                matchingResources = matchingResources.concat(
                    response.data.filter((service) => this.containsAllTags(service.category_taxonomies, tagIds))
                )

                // run out of services
                if (response.data.length < 100) {
                    break
                }

                page += 1
            }
        }

        return { data: matchingResources, currentPage: page }
    }

    /**
     * @private
     */
    containsAllTags(taxonomy, tagIds) {
        if (!tagIds || !tagIds.length) {
            return true
        }

        return tagIds.every((tId) => taxonomy.some((tax) => tax.id === tId))
    }

    async search(query) {
        if (!query) {
            return []
        }

        const serviceQuery = {
            q: query.q,
            tags: query.tags,
            meta: {
                currentPage: query.meta.servicePage,
                currentIndex: query.meta.serviceIndex,
            },
        }

        const serviceSearch = this.searchResourcesMatchingAllTags(this.searchServices.bind(this), serviceQuery, 25)

        const resourceQuery = {
            q: query.q,
            tags: query.tags,
            meta: {
                currentPage: query.meta.servicePage,
                currentIndex: query.meta.serviceIndex,
            },
        }

        const resourceSearch = this.searchResourcesMatchingAllTags(this.searchResources.bind(this), resourceQuery, 25)

        let results = await Promise.all([serviceSearch, resourceSearch])

        const pagedResults = this.collectPage(results, 25)

        return this.formatResources(pagedResults)
    }

    /**
     * @private
     */
    collectPage(resultSets, pageSize) {
        const combined = {}

        const [services, resources] = resultSets

        combined.servicePage = services.currentPage
        combined.resourcePage = resources.currentPage

        let i = 0
        let total = 0

        let combinedPage = []

        let servicesIndex = null
        let resourcesIndex = null

        for (i = 0; i < pageSize; i++) {
            if (i > services.data.length && i > resources.data.length) {
                break
            }

            const service = services.data[i]

            if (service) {
                combinedPage.push(service)
                servicesIndex = i + 1
                total += 1
            }

            if (total >= pageSize) {
                break
            }

            const resource = resources.data[i]

            if (resource) {
                combinedPage.push(resource)
                total += 1
                resourcesIndex = i + 1
            }

            if (total >= pageSize) {
                break
            }
        }

        let nextService = null
        let nextResource = null

        if (servicesIndex !== null) {
            nextService = services.data[servicesIndex]
        }

        if (resourcesIndex !== null) {
            nextResource = resources.data[resourcesIndex]
        }

        combined.data = combinedPage
        combined.serviceIndex = (nextService && nextService.id) || null
        combined.resourceIndex = (nextResource && nextResource.id) || null

        combined.servicePage = combined.serviceIndex ? services.currentPage : services.currentPage + 1
        combined.resourcePage = resources.currentPage ? resources.currentPage : resources.currentPage + 1

        combined.lastPage = combinedPage.length < 25 || (services.data.length === 0 && resources.data.length === 0)

        return combined
    }

    /**
     * @private
     */
    async searchServices(query) {
        const args = this.buildRequest("serviceSearch", this.buildQuery(query))

        return await request(args)
    }

    /**
     * @private
     */
    async searchResources(query) {
        const args = this.buildRequest("resourceSearch", this.buildQuery(query))

        return await request(args)
    }

    /**
     * @private
     * @param {Object} query
     */
    buildQuery(query) {
        const queryParam = query.q
        const tagParam = query.tags
        const page = query.page

        const filters = {}

        if (queryParam) {
            filters["filter[name]"] = queryParam
        }

        if (tagParam) {
            filters["filter[taxonomy_id]"] = tagParam
        }

        if (page) {
            filters["page"] = page
        }

        filters["per_page"] = 100

        return filters
    }

    /**
     * @private
     * @param {string} servicePoint the configuration service point
     * @returns {Object} requestArguments
     */
    buildRequest(servicePoint, query) {
        const { configuration } = this

        const servicePointConfiguration = configuration.api.servicePoints[servicePoint]

        if (!servicePointConfiguration) {
            throw Error(`Configuration for service point ${servicePoint} not found`)
        }

        let requestArguments = {
            url: `${configuration.api.host}/${servicePointConfiguration.endpoint}`,
            ...servicePointConfiguration.arguments,
        }

        if (query) {
            requestArguments.qs = query
        }

        return requestArguments
    }
}

module.exports = RepositoryDataProvider
