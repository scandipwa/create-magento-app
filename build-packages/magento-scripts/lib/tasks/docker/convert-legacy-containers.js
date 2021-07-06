/* eslint-disable no-param-reassign */
const { getBaseConfig, getConfigFromMagentoVersion } = require('../../config');
const getDockerConfig = require('../../config/docker');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const { folderName } = require('../../util/prefix');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const convertLegacyContainers = {
    task: async (ctx, task) => {
        const { config: { overridenConfiguration, baseConfig } } = ctx;
        const legacyDockerConfig = await getDockerConfig(overridenConfiguration, baseConfig);
        const newDockerConfig = await getDockerConfig(overridenConfiguration, getBaseConfig(process.cwd(), folderName));

        const legacyVolumes = Object.values(legacyDockerConfig.volumes).map(({ name }) => name);
        const newVolumes = Object.keys(newDockerConfig.volumes).map(({ name }) => name);

        const existingVolumes = (await execAsyncSpawn('docker volume ls -q')).split('\n');

        if (
            newVolumes.every((v) => !existingVolumes.includes(v))
            && legacyVolumes.every((v) => existingVolumes.includes(v))
        ) {
            task.title = 'Converting old volumes to new ones.';
        }

        ctx.config = await getConfigFromMagentoVersion(
            ctx.magentoVersion,
            process.cwd(),
            folderName
        );
    }
};

module.exports = convertLegacyContainers;
