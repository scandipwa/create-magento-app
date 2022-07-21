const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 *
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
    } = options;

    const allArg = all && '--all';
    const filterArg = filter && typeof filter === 'string'
        ? `--filter=${filter}`
        : filter && Array.isArray(filter) && filter.every((f) => typeof f === 'string') && filter.map((f) => `--filter=${f}`).join(' ');
    const formatArg = !formatToJSON && format
        ? `--format=${format}`
        : formatToJSON && '--format=\'{{json .}}\'';
    const digestsArg = digests && '--digests';
    const noTruncArg = noTrunc && '--no-trunc';
    const quietArg = quiet && '--quiet';

    const args = [
        allArg,
        filterArg,
        formatArg,
        digestsArg,
        noTruncArg,
        quietArg
    ].filter(Boolean).join(' ');

    if (formatToJSON) {
        const result = await execAsyncSpawn(`docker image ls ${args}`, execOptions);
        return JSON.parse(`[${result.split('\n').join(', ')}]`);
    }

    return execAsyncSpawn(`docker image ls ${args}`, execOptions);
};

module.exports = {
    ls
};
