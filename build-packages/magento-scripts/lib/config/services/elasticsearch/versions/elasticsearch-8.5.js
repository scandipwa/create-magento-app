const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch85 = () => ({
    image: 'elasticsearch:8.5.3',
    env: defaultEnv
})

module.exports = elasticsearch85
