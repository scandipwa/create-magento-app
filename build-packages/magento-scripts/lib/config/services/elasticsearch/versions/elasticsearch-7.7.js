const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch77 = () => ({
    image: 'elasticsearch:7.7.1',
    env: defaultEnv
})

module.exports = elasticsearch77
