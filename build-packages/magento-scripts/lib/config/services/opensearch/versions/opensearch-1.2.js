const defaultEnv = require('../default-os-env')

/**
 * @returns {import('../../../../../typings/index').OpenSearchSearchConfiguration}
 */
const opensearch12 = () => ({
    image: 'opensearchproject/opensearch:1.2.4',
    env: {
        ...defaultEnv,
        'indices.id_field_data.enabled': true,
        DISABLE_INSTALL_DEMO_CONFIG: true
    }
})

module.exports = opensearch12
