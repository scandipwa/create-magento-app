const semver = require('semver');
const UnknownError = require('../../errors/unknown-error');
const setConfigFile = require('../../util/set-config');
const { getEnabledExtensionsFromImage } = require('../docker/project-image-builder');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpConfig = () => ({
    title: 'Setting PHP config',
    task: async (ctx) => {
        const {
            config: {
                php,
                baseConfig
            },
            debug,
            isDockerDesktop
        } = ctx;
        const containers = ctx.config.docker.getContainers(ctx.ports);
        const phpExtensions = await getEnabledExtensionsFromImage(containers.php.debugImage);
        const isXDebug2 = semver.satisfies(phpExtensions.xdebug, '2');

        const hostMachine = !isDockerDesktop ? '127.0.0.1' : 'host.docker.internal';

        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: php.iniTemplatePath,
                overwrite: true,
                templateArgs: {
                    debug,
                    mageRoot: baseConfig.containerMagentoDir,
                    isXDebug2,
                    hostMachine
                }
            });
        } catch (e) {
            throw new UnknownError(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
});

module.exports = createPhpConfig;
