const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch716 = () => ({
    image: 'elasticsearch:7.16.3',
    env: defaultEnv
})

module.exports = elasticsearch716
