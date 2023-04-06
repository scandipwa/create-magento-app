const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch84 = () => ({
    image: 'elasticsearch:8.4.3',
    env: defaultEnv
})

module.exports = elasticsearch84
