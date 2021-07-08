/* eslint-disable no-param-reassign */
const { getConfigFromMagentoVersion } = require('./index');
const { folderName } = require('../util/prefix');
const convertLegacyVolumes = require('../tasks/docker/convert-legacy-volumes');

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getProjectConfiguration = {
    title: 'Getting project configuration',
    task: async (ctx, task) => {
        const { magentoVersion } = ctx;

        ctx.config = await getConfigFromMagentoVersion(magentoVersion, process.cwd(), folderName);

        return task.newListr(
            convertLegacyVolumes
        );
    }
};

module.exports = getProjectConfiguration;
