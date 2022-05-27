class KnownError extends Error {
    /**
     * @param {String} message Error message
     * @param {String} [name] Error name
     * @param {{ reportToAnalytics?: boolean }} [param2]
     */
    constructor(message, name = 'Known Error', { reportToAnalytics = true } = {}) {
        super(message);
        this.name = name;

        this.reportToAnalytics = reportToAnalytics;
    }
}

module.exports = KnownError;
