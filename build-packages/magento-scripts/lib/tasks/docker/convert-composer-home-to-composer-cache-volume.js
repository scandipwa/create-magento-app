const { containerApi } = require('./containers');
const volumeApi = require('./volume/volume-api');

const composeHomeDataVolumeName = 'composer_home-data';

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const convertComposerHomeToComposerCacheVolume = () => ({
    skip: async () => {
        const volumeList = await volumeApi.ls({
            formatToJSON: true,
            filter: `name=${ composeHomeDataVolumeName }`
        });

        return volumeList.length === 0;
    },
    task: async (ctx, task) => {
        const { composer_cache } = ctx.config.docker.volumes;
        task.title = `Migrating from ${ composer_cache.name } volume to ${ composeHomeDataVolumeName }...`;
        await containerApi.run({
            rm: true,
            detach: false,
            mountVolumes: [
                `${ composeHomeDataVolumeName }:/from:ro`,
                `${ composer_cache.name }:/to`
            ],
            image: 'alpine',
            command: 'ash -c "cd /from/cache; cp -av . /to"'
        });

        await volumeApi.rm({ volumes: [composeHomeDataVolumeName] });
    }
});

module.exports = {
    convertComposerHomeToComposerCacheVolume
};
