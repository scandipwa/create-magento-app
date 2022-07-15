const semver = require('semver');
const UnknownError = require('../../errors/unknown-error');
const setConfigFile = require('../../util/set-config');
const { getEnabledExtensions } = require('../docker/project-image-builder');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpConfig = () => ({
    title: 'Setting PHP config',
    task: async (ctx) => {
        const {
            config: {
                php, baseConfig, debug, ports
            }
        } = ctx;
        const containers = ctx.config.docker.getContainers(ctx.ports);
        const phpExtensions = await getEnabledExtensions(`${containers.php.image}.xdebug`);
        const isXDebug2 = semver.satisfies(phpExtensions.xdebug, '2');

        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: php.iniTemplatePath,
                overwrite: true,
                templateArgs: {
                    ports,
                    debug,
                    mageRoot: baseConfig.magentoDir,
                    isXDebug2
                }
            });
        } catch (e) {
            throw new UnknownError(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
});

module.exports = createPhpConfig;
