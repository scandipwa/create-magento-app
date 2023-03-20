const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch840 = () => ({
    image: 'elasticsearch:8.4.0',
    env: defaultEnv
})

module.exports = elasticsearch840
