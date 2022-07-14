/* eslint-disable max-len */
const enableExtension = require('./extensions/enable');
const installExtension = require('./extensions/install');
const disableExtension = require('./extensions/disable');
const {
    getEnabledExtensions,
    getInstalledExtensions,
    getDisabledExtensions
} = require('./extensions');

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const configurePHP = () => ({
    title: 'Configuring PHP extensions',
    task: async ({ config, debug }, task) => {
        const { php, php: { disabledExtensions = [] } } = config;
        const enabledExtensions = await getEnabledExtensions(config);
        const installedExtensions = await getInstalledExtensions(config);
        const disabledExtensionsInPHP = await getDisabledExtensions(config);

        if (!debug && enabledExtensions.xdebug && !disabledExtensions.includes('xdebug')) {
            disabledExtensions.push('xdebug');
        }

        /** @type {[string, import('../../../typings/index').PHPExtensionInstallationInstruction][]} */
        const missingExtensions = Object.entries(php.extensions)
            .filter(([name, options]) => {
                const extensionName = options.extensionName || name;

                return !disabledExtensions.includes(extensionName);
            })
            // check if module is not loaded and if it is loaded check installed version
            .filter(([name, options]) => {
                const extensionName = options.extensionName || name;
                if (extensionName === 'xdebug' && !debug) {
                    return false;
                }
                if (!enabledExtensions[extensionName]) {
                    return true;
                }

                if (options && options.version && enabledExtensions[extensionName] !== options.version) {
                    return true;
                }

                return false;
            });

        /** @type {import('listr2').ListrTask[]} */
        const extensionTasks = [];

        if (missingExtensions.length > 0) {
            missingExtensions.forEach(([extensionName, extensionOptions]) => {
                if (installedExtensions.includes(extensionName) && disabledExtensionsInPHP.includes(extensionName)) {
                    extensionTasks.push(enableExtension(extensionName, extensionOptions));
                } else {
                    extensionTasks.push(installExtension(extensionName, extensionOptions));
                }
            });
        }

        if (disabledExtensions.length > 0) {
            disabledExtensions.forEach((extensionName) => {
                extensionTasks.push(disableExtension(extensionName));
            });
        }

        if (extensionTasks.length === 0) {
            task.skip();
            return;
        }

        return task.newListr(
            extensionTasks,
            {
                concurrent: false,
                rendererOptions: {
                    collapse: false
                }
            }
        );
    },
    options: {
        bottomBar: 10
    }
});

module.exports = configurePHP;
