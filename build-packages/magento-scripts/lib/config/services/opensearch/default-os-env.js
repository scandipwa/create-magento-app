/**
 * @type {Record<string, unknown>}
 */
module.exports = {
    'bootstrap.memory_lock': true,
    'discovery.type': 'single-node',
    OPENSEARCH_JAVA_OPTS: '-Xms2g -Xmx2g',
    DISABLE_SECURITY_PLUGIN: true,
    DISABLE_PERFORMANCE_ANALYZER_AGENT_CLI: true
}
