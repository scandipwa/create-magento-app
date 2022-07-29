const os = require('os');
const { getArchSync } = require('../../../../util/arch');
const { deepmerge } = require('../../../../util/deepmerge');
const { repo } = require('../base-repo');

/**
 * @returns {import('../../../../../typings/index').ServiceWithImage}
 */
const elasticsearch68 = ({
    image = `${ repo }:elasticsearch-6.8`
} = {}) => ({
    image,
    env: deepmerge({
        'bootstrap.memory_lock': true,
        'xpack.security.enabled': false,
        'discovery.type': 'single-node',
        ES_JAVA_OPTS: '-Xms512m -Xmx512m'
    }, os.platform() === 'darwin' && getArchSync() === 'arm64' ? {
        'xpack.ml.enabled': false
    } : {})
});

module.exports = elasticsearch68;
