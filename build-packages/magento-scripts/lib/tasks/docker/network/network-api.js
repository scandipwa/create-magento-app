const { execAsyncSpawn } = require('../../../util/exec-async-command')

/**
 * @param {import('./network-api').NetworkLsOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const ls = async (options, execOptions = {}) => {
    const { filter, format, formatToJSON = false, noTrunc, quiet } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"
    const filterArg =
        filter && typeof filter === 'string'
            ? `--filter=${filter}`
            : filter &&
              Array.isArray(filter) &&
              filter.every((f) => typeof f === 'string') &&
              filter.map((f) => `--filter=${f}`).join(' ')
    const noTruncArg = noTrunc && '--no-trunc'
    const quietArg = quiet && '--quiet'
    const args = [filterArg, formatArg, noTruncArg, quietArg]
        .filter(Boolean)
        .join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker network ls ${args}`,
            execOptions
        )
        return JSON.parse(`[${result.split('\n').join(', ')}]`)
    }

    return execAsyncSpawn(`docker network ls ${args}`, execOptions)
}

/**
 * @param {import('./network-api').NetworkInspectOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const inspect = async (options, execOptions = {}) => {
    const { network, format, formatToJSON = false, verbose } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"
    const verboseArg = verbose && '--verbose'
    const networks = typeof network === 'string' ? network : network.join(' ')

    const args = [formatArg, verboseArg].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker network inspect ${args} ${networks}`,
            execOptions
        )
        return JSON.parse(result)
    }

    return execAsyncSpawn(
        `docker network inspect ${args} ${networks}`,
        execOptions
    )
}

/**
 * @param {import('./network-api').NetworkCreateOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const create = async (options, execOptions = {}) => {
    const { network, driver } = options

    const networks = typeof network === 'string' ? network : network.join(' ')

    const driverArg = driver && `--driver='${driver}'`

    const args = [driverArg].filter(Boolean).join(' ')

    return execAsyncSpawn(
        `docker network create ${args} ${networks}`,
        execOptions
    )
}

module.exports = {
    ls,
    inspect,
    create
}
