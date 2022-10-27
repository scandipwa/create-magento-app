const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch76 = () => ({
    image: 'elasticsearch:7.6.2',
    env: defaultEnv
})

module.exports = elasticsearch76
