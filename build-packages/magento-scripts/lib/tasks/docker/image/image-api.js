const { execAsyncSpawn } = require('../../../util/exec-async-command')

/**
 * @param {import('./image-api').ImagesLsOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const ls = async (options, execOptions = {}) => {
    const {
        all,
        filter,
        format,
        formatToJSON = false,
        noTrunc,
        quiet,
        digests
    } = options

    const allArg = all && '--all'
    const filterArg =
        filter && typeof filter === 'string'
            ? `--filter=${filter}`
            : filter &&
              Array.isArray(filter) &&
              filter.every((f) => typeof f === 'string') &&
              filter.map((f) => `--filter=${f}`).join(' ')
    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"
    const digestsArg = digests && '--digests'
    const noTruncArg = noTrunc && '--no-trunc'
    const quietArg = quiet && '--quiet'

    const args = [
        allArg,
        filterArg,
        formatArg,
        digestsArg,
        noTruncArg,
        quietArg
    ]
        .filter(Boolean)
        .join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker image ls ${args}`,
            execOptions
        )
        return JSON.parse(`[${result.split('\n').join(', ')}]`)
    }

    return execAsyncSpawn(`docker image ls ${args}`, execOptions)
}

/**
 * @param {import('./image-api').ImagesInspectOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const inspect = async (options, execOptions = {}) => {
    const { image, format, formatToJSON = false } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"

    const args = [formatArg, image].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker image inspect ${args}`,
            execOptions
        )
        return JSON.parse(result)
    }

    return execAsyncSpawn(`docker image inspect ${args}`, execOptions)
}

/**
 * @param {import('./image-api').ImagesPullOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const pull = async (options, execOptions = {}) => {
    const { image, allTags, platform, quiet } = options

    const allTagsArg = typeof allTags === 'boolean' ? '--all-tags' : ''
    const platformArg =
        typeof platform === 'string' ? `--platform=${platform}` : ''

    const quietArg = typeof quiet === 'boolean' ? '--quiet' : ''

    const args = [allTagsArg, platformArg, quietArg, image]
        .filter(Boolean)
        .join(' ')

    return execAsyncSpawn(`docker image pull ${args}`, execOptions)
}

module.exports = {
    ls,
    inspect,
    pull
}
