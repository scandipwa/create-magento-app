/**
 * @param {number} timeout
 * @returns {Promise<void>}
 */
const sleep = (timeout) =>
    new Promise((resolve) => setTimeout(resolve, timeout))

module.exports = sleep
