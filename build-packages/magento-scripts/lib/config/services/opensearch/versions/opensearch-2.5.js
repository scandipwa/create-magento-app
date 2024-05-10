const defaultEnv = require('../default-os-env')

/**
 * @returns {import('../../../../../typings/index').OpenSearchSearchConfiguration}
 */
const opensearch25 = () => ({
    image: 'opensearchproject/opensearch:2.5.0',
    env: {
        ...defaultEnv,
        'indices.id_field_data.enabled': true,
        DISABLE_INSTALL_DEMO_CONFIG: true
    }
})

module.exports = opensearch25
