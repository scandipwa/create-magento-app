const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ServiceWithImage}
 */
const elasticsearch717 = () => ({
    image: 'elasticsearch:7.17.6',
    env: defaultEnv
})

module.exports = elasticsearch717
