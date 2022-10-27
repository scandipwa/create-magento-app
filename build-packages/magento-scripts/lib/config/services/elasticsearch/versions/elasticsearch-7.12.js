const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch712 = () => ({
    image: 'elasticsearch:7.12.1',
    env: defaultEnv
})

module.exports = elasticsearch712
