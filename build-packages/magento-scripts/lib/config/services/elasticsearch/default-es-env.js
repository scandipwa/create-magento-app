/**
 * @type {Record<string, unknown>}
 */
module.exports = {
    'bootstrap.memory_lock': true,
    'xpack.security.enabled': false,
    'discovery.type': 'single-node',
    ES_JAVA_OPTS: '-Xms2g -Xmx2g'
}
