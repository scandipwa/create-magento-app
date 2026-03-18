const os = require('os')
const { getArchSync } = require('../../../../util/arch')
const { deepmerge } = require('../../../../util/deepmerge')
const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch68 = () => ({
    image: 'elasticsearch:6.8.23',
    env: deepmerge(
        defaultEnv,
        os.platform() === 'darwin' && getArchSync() === 'arm64'
            ? {
                  'xpack.ml.enabled': false
              }
            : {}
    ),
    platform: 'linux/amd64'
})

module.exports = elasticsearch68
