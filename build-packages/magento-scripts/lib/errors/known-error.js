class KnownError extends Error {
    /**
     * @param {String} name Error name
     * @param {String} message Error message
     * @param {{ reportToAnalytics?: boolean }} [param2]
     */
    constructor(name, message, { reportToAnalytics = true } = {}) {
        super(message);
        this.name = name;

        this.reportToAnalytics = reportToAnalytics;
    }
}

module.exports = KnownError;
