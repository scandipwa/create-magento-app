const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch717 = () => ({
    image: 'elasticsearch:7.17.23',
    env: defaultEnv
})

module.exports = elasticsearch717
