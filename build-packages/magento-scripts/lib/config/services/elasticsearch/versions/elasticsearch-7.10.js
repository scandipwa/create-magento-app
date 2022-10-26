const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch710 = () => ({
    image: 'elasticsearch:7.10.1',
    env: defaultEnv
})

module.exports = elasticsearch710
