const semver = require('semver');
const UnknownError = require('../../errors/unknown-error');
const setConfigFile = require('../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpConfig = () => ({
    title: 'Setting PHP config',
    task: async ({ config: { php, baseConfig, overridenConfiguration: { configuration } }, debug, ports }) => {
        const isXDebug2 = semver.satisfies(configuration.php.extensions.xdebug.version, '2');
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
