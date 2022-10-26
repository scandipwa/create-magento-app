class UnknownError extends Error {
    /**
     * @param {String} message Error message
     * @param {String} [name] Error name
     * @param {{ reportToAnalytics?: boolean }} [options]
     */
    constructor(message, name = 'Unknown Error', options = {}) {
        super(message)
        this.name = name

        const { reportToAnalytics = true } = options

        this.reportToAnalytics = reportToAnalytics
    }
}

module.exports = UnknownError
