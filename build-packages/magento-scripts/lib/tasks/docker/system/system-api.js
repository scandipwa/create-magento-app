const { execAsyncSpawn } = require('../../../util/exec-async-command')

/**
 * @param {import('./system-api').SystemDFOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const df = async (options, execOptions = {}) => {
    const { format, formatToJSON, verbose } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"
    const verboseArg = verbose && '--verbose'

    const args = [formatArg, verboseArg].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker system df ${args}`,
            execOptions
        )

        return JSON.parse(result)
    }

    return execAsyncSpawn(`docker system df ${args}`, execOptions)
}

/**
 * @param {import('./system-api').SystemVersionOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
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

module.exports = {
    df,
    version
}
