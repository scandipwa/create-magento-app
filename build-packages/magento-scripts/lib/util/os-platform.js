const getos = require('getos');

const osPlatform = () => new Promise((resolve, reject) => getos((err, os) => (err ? reject(err) : resolve(os))));

module.exports = osPlatform;
