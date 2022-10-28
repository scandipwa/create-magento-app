const { execAsyncSpawn } = require('../../util/exec-async-command')

/**
 * @param {import('./api').DockerVersionOptions} options
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const version = async (options, execOptions = {}) => {
    const { format, formatToJSON } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"
    const args = [formatArg].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker version ${args}`,
            execOptions
        )
        return JSON.parse(result)
    }

    return execAsyncSpawn(`docker version ${args}`, execOptions)
}

/**
 * @param {import('./api').DockerContextOptions} options
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const context = async (options, execOptions = {}) => {
    const { format, formatToJSON } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"
    const args = [formatArg].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker context ls ${args}`,
            execOptions
        )
        if (result.startsWith('[')) {
            return JSON.parse(result)
        }

        return JSON.parse(`[${result.split('\n').join(', ')}]`)
    }

    return execAsyncSpawn(`docker context ls ${args}`, execOptions)
}

module.exports = {
    version,
    context
}
