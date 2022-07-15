const { execAsyncSpawn } = require('./exec-async-command');

const runContainerImage = async (imageWithTag, command) => execAsyncSpawn(`docker run ${imageWithTag} ${command}`);

/**
 * @param {string} imageWithTag
 * @param {string} command
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const runContainerImageTask = (imageWithTag, command) => ({
    task: () => runContainerImage(imageWithTag, command)
});

module.exports = {
    runContainerImage,
    runContainerImageTask
};
