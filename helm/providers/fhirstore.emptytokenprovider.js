class EmptyTokenProvider {
    /**
     * @public
     * @param {import("./fhirstore.tokenprovider").RequestOptions} request
     * @returns {Promise<void>}
     */
    async authorize(request) {
        request.auth = undefined
    }
}

module.exports = EmptyTokenProvider
