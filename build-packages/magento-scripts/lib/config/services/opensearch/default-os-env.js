/**
 * @type {Record<string, unknown>}
 */
module.exports = {
    'bootstrap.memory_lock': true,
    'discovery.type': 'single-node',
    OPENSEARCH_JAVA_OPTS: '-Xms512m -Xmx2048m',
    DISABLE_SECURITY_PLUGIN: true,
    DISABLE_PERFORMANCE_ANALYZER_AGENT_CLI: true
}
