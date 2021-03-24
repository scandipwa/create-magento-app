const getos = require('getos');

/**
 *
 * @returns {Promise<import('getos').OS>}
 */
const osPlatform = () => new Promise((resolve, reject) => getos((err, os) => (err ? reject(err) : resolve(os))));

module.exports = osPlatform;
