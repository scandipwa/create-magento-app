const defaultEnv = require('../default-os-env')

/**
 * @returns {import('../../../../../typings/index').OpenSearchSearchConfiguration}
 */
const opensearch13 = () => ({
    image: 'opensearchproject/opensearch:1.3.20',
    env: {
        ...defaultEnv,
        'indices.id_field_data.enabled': true,
        DISABLE_INSTALL_DEMO_CONFIG: true
    }
})

module.exports = opensearch13
