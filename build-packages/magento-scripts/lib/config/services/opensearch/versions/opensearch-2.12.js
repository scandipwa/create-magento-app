const defaultEnv = require('../default-os-env')

/**
 * @returns {import('../../../../../typings/index').OpenSearchSearchConfiguration}
 */
const opensearch212 = () => ({
    image: 'opensearchproject/opensearch:2.12.0',
    env: {
        ...defaultEnv,
        'indices.id_field_data.enabled': true
    }
})

module.exports = opensearch212
