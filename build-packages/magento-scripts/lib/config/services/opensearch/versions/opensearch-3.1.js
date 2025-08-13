const defaultEnv = require('../default-os-env')

/**
 * @returns {import('../../../../../typings/index').OpenSearchSearchConfiguration}
 */
const opensearch310 = () => ({
    image: 'opensearchproject/opensearch:3.1.0',
    env: {
        ...defaultEnv,
        'indices.id_field_data.enabled': true
    }
})

module.exports = opensearch310
