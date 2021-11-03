/* eslint-disable max-len */
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const enableExtension = require('./extensions/enable');
const installExtension = require('./extensions/install');
const disableExtension = require('./extensions/disable');

/**
 * Get enabled extensions list with versions
 * @param {import('../../../typings/context').ListrContext['config']} param0
 * @returns {Promise<{[key: string]: string}}>}
 */
const getEnabledExtensions = async ({ php }) => {
    const output = await execAsyncSpawn(
        `${ php.binPath } -c ${php.iniPath} -r 'foreach (get_loaded_extensions() as $extension) echo "$extension:" . phpversion($extension) . "\n";'`
    );

    return output
        .split('\n')
        .map((m) => {
            // eslint-disable-next-line no-unused-vars
            const [_, moduleName, moduleVersion] = m.match(/(.+):(.+)/i);

            return [moduleName, moduleVersion];
        })
        .reduce((acc, [name, version]) => ({ ...acc, [name]: version }), {});
};

/**
 * Get installed extensions
 * @param {import('../../../typings/context').ListrContext['config']} param0
 * @returns {Promise<string[]>}
 */
const getInstalledExtensions = async ({ php }) => {
    const extensionDirectory = path.join(os.homedir(), '.phpbrew', 'build', `php-${php.version}`, 'ext');

    const availableExtensions = await fs.promises.readdir(extensionDirectory, {
        encoding: 'utf-8'
    });

    return availableExtensions;
};

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const configure = () => ({
    title: 'Configuring PHP extensions',
    task: async ({ config, debug }, task) => {
        const { php, php: { disabledExtensions = [] } } = config;
        const enabledExtensions = await getEnabledExtensions(config);
        const installedExtensions = await getInstalledExtensions(config);

        if (!debug && enabledExtensions.xdebug && !disabledExtensions.includes('xdebug')) {
            disabledExtensions.push('xdebug');
        }

        /** @type {[string, import('../../../typings/index').PHPExtension][]} */
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
                if (installedExtensions.includes(extensionName)) {
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

module.exports = configure;
