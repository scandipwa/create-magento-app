/* eslint-disable max-classes-per-file */
class CMAError extends Error {
    /**
     * @param {String} message
     * @param {{ reportAnalytics: boolean }} param1
     */
    constructor(message, { reportAnalytics = true } = {}) {
        super(message);
        this.name = 'CMA Error';
        /**
         * @type {Boolean}
         */
        this.reportAnalytics = reportAnalytics;
    }
}

class CMAInstallError extends CMAError {
    constructor(...args) {
        super(...args);
        this.name = 'CMA Install Error';
    }
}

class CMASetupError extends CMAError {
    constructor(...args) {
        super(...args);
        this.name = 'CMA Setup Error';
    }
}

module.exports = {
    CMAError,
    CMAInstallError,
    CMASetupError
};
