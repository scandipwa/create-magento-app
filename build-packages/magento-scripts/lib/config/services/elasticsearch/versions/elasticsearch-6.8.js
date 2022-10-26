const os = require('os')
const { getArchSync } = require('../../../../util/arch')
const { deepmerge } = require('../../../../util/deepmerge')
const { repo } = require('../base-repo')
const defaultEnv = require('../default-es-env')

/**
 * @returns {import('../../../../../typings/index').ElasticSearchConfiguration}
 */
const elasticsearch68 = ({ image = `${repo}:elasticsearch-6.8` } = {}) => ({
    image,
    env: deepmerge(
        defaultEnv,
        os.platform() === 'darwin' && getArchSync() === 'arm64'
            ? {
                  'xpack.ml.enabled': false
              }
            : {}
    )
})

module.exports = elasticsearch68
