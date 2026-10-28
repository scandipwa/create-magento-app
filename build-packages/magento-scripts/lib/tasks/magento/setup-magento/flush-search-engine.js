const { execAsyncSpawn } = require('../../../util/exec-async-command')
const sleep = require('../../../util/sleep')
const KnownError = require('../../../errors/known-error')
const UnknownError = require('../../../errors/unknown-error')

const HEALTH_CHECK_ATTEMPTS = 60

/**
 * Search engines reject HTTP request lines longer than 4096 bytes
 * (`http.max_initial_line_length`), so index names are deleted in batches
 * whose comma-separated list stays well below that.
 */
const MAX_INDICES_PATH_LENGTH = 3000

/**
 * @param {string[]} indices
 * @returns {string[][]}
 */
const batchIndices = (indices) => {
    /** @type {string[][]} */
    const batches = []
    let batch = []
    let batchLength = 0

    for (const index of indices) {
        if (
            batch.length > 0 &&
            batchLength + index.length + 1 > MAX_INDICES_PATH_LENGTH
        ) {
            batches.push(batch)
            batch = []
            batchLength = 0
        }

        batch.push(index)
        batchLength += index.length + 1
    }

    if (batch.length > 0) {
        batches.push(batch)
    }

    return batches
}

/**
 * @param {string} containerName
 * @param {string[]} indices
 */
const deleteIndices = async (containerName, indices) => {
    const result = await execAsyncSpawn(
        `docker exec ${containerName} curl --silent --show-error -X DELETE 'localhost:9200/${indices.join(
            ','
        )}'`
    )

    let response = null
    try {
        response = JSON.parse(result)
    } catch {
        // non-JSON output is reported below
    }

    if (!response || response.acknowledged !== true) {
        throw new UnknownError(
            `Failed to delete search engine indices in container ${containerName}: ${result}`
        )
    }
}

/**
 * @param {string} containerName
 */
const waitForSearchEngine = async (containerName) => {
    for (let attempt = 0; attempt < HEALTH_CHECK_ATTEMPTS; attempt++) {
        const { code } = await execAsyncSpawn(
            `docker exec ${containerName} curl --silent --fail localhost:9200/_cluster/health`,
            { withCode: true }
        )

        if (code === 0) {
            return
        }

        await sleep(1000)
    }

    throw new KnownError(
        `Search engine in container ${containerName} did not become available in ${HEALTH_CHECK_ATTEMPTS} seconds`
    )
}

/**
 * Deletes all search engine indices left over from a previously imported database,
 * so search cannot return documents that no longer exist in the new database.
 *
 * Indices are deleted by name because Elasticsearch 8 rejects `DELETE /_all` by default
 * (`action.destructive_requires_name`). System indices (prefixed with `.`) are kept.
 *
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Flushing search engine indices',
    task: async ({ ports, config: { docker } }, task) => {
        const {
            elasticsearch: { name }
        } = docker.getContainers(ports)

        await waitForSearchEngine(name)

        const result = await execAsyncSpawn(
            `docker exec ${name} curl --silent --show-error --fail 'localhost:9200/_cat/indices?h=index'`
        )

        const indices = result
            .split('\n')
            .map((index) => index.trim())
            .filter((index) => index && !index.startsWith('.'))

        if (indices.length === 0) {
            task.skip('No search engine indices to flush')
            return
        }

        for (const batch of batchIndices(indices)) {
            await deleteIndices(name, batch)
        }

        task.title = `Flushed ${indices.length} search engine indices`
    }
})
