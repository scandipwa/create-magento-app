const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * @param {import('./api').DockerVersionOptions} options
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions} execOptions
 */
const version = async (options, execOptions = {}) => {
    const {
        format,
        formatToJSON
    } = options;

    const formatArg = !formatToJSON && format
        ? `--format=${format}`
        : formatToJSON && '--format=\'{{json .}}\'';
    const args = [
        formatArg
    ].filter(Boolean).join(' ');

    if (formatToJSON) {
        const result = await execAsyncSpawn(`docker version ${args}`, execOptions);
        return JSON.parse(result);
    }

    return execAsyncSpawn(`docker version ${args}`, execOptions);
};

module.exports = {
    version
};
