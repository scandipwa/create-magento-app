const { execAsyncSpawn } = require('../../../util/exec-async-command')

/**
 * @param {import('./volume-api').VolumeCreateOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const create = async (options, execOptions = {}) => {
    const { driver, label, opt, name } = options

    const driverArg = driver && `--driver=${driver}`
    const labelArg = label && `--label=${label}`
    const optArg =
        opt &&
        Object.entries(opt)
            .map(([name, value]) => `--opt ${name}="${value}"`)
            .join(' ')

    const args = [driverArg, labelArg, optArg, name].filter(Boolean).join(' ')

    return execAsyncSpawn(`docker volume create ${args}`, execOptions)
}

/**
 * @param {import('./volume-api').VolumeLsOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const ls = async (options, execOptions = {}) => {
    const { filter, format, formatToJSON = false, quiet } = options

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
    const quietArg = quiet && '--quiet'

    const args = [filterArg, formatArg, quietArg].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker volume ls ${args}`,
            execOptions
        )
        return JSON.parse(`[${result.split('\n').join(', ')}]`)
    }

    return execAsyncSpawn(`docker volume ls ${args}`, execOptions)
}

/**
 * @param {import('./volume-api').VolumeRmOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const rm = async (options, execOptions = {}) => {
    const { force, volumes } = options

    const forceArg = force && '--force'

    const command = ['docker', 'volume', 'rm', forceArg, ...volumes]
        .filter(Boolean)
        .join(' ')

    return execAsyncSpawn(command, execOptions)
}

/**
 * @param {import('./volume-api').VolumeInspectOptions} options
 * @param {import('../../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const inspect = async (options, execOptions = {}) => {
    const { volume, format, formatToJSON = false } = options

    const formatArg =
        !formatToJSON && format
            ? `--format=${format}`
            : formatToJSON && "--format='{{json .}}'"

    const args = [formatArg, volume].filter(Boolean).join(' ')

    if (formatToJSON) {
        const result = await execAsyncSpawn(
            `docker volume inspect ${args}`,
            execOptions
        )
        return JSON.parse(result)
    }

    return execAsyncSpawn(`docker volume inspect ${args}`, execOptions)
}

module.exports = {
    create,
    ls,
    rm,
    inspect
}
