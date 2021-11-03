/* eslint-disable max-len */
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const macosVersion = require('macos-version');

/**
 * Get enabled extensions list with versions
 * @param {Object} param0
 * @param {import('../../../typings/context').ListrContext['config']['php']} param0.php
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
 * @param {Object} param0
 * @param {import('../../../typings/context').ListrContext['config']['php']} param0.php
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
 * @type {(extensions: string[]) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const disablingExtensions = (extensions) => ({
    title: `Disabling extensions ${extensions.join(', ')}`,
    task: async ({ config: { overridenConfiguration: { configuration: { php } } } }, task) => {
        try {
            for (const extension of extensions) {
                await execAsyncSpawn(`
                source ~/.phpbrew/bashrc && \
                phpbrew use ${ php.version } && \
                phpbrew ext disable ${extension}`, {
                    callback: (t) => {
                        task.output = t;
                    }
                });
            }
        } catch (e) {
            throw new Error(`Something went wrong during extension disabling.\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const configure = () => ({
    title: 'Configuring PHP extensions',
    task: async ({ config, debug }, task) => {
        const { php, overridenConfiguration: { configuration: { php: { disabledExtensions = [] } } } } = config;
        const enabledExtensions = await getEnabledExtensions({ php });
        const installedExtensions = await getInstalledExtensions({ php });

        if (!debug && enabledExtensions.xdebug && !disabledExtensions.includes('xdebug')) {
            disabledExtensions.push('xdebug');
        }

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

        if (missingExtensions.length > 0) {
            try {
                for (const [extensionName, extensionOptions] of missingExtensions) {
                    const options = macosVersion.isMacOS ? extensionOptions.macOptions : extensionOptions.options;
                    const { hooks = {} } = extensionOptions;
                    if (hooks.preInstall) {
                        await Promise.resolve(hooks.preInstall(config));
                    }
                    if (installedExtensions.includes(extensionName)) {
                        await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                        phpbrew use ${ php.version } && \
                        phpbrew ext enable ${ extensionName }`,
                        {
                            callback: (t) => {
                                task.output = t;
                            }
                        });
                    } else {
                        await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                        phpbrew use ${ php.version } && \
                        phpbrew ext install ${ extensionName }${ extensionOptions.version ? ` ${extensionOptions.version}` : ''}${ options ? ` -- ${ options }` : ''}`,
                        {
                            callback: (t) => {
                                task.output = t;
                            }
                        });
                    }
                    if (hooks.postInstall) {
                        await Promise.resolve(hooks.postInstall(config));
                    }
                }
            } catch (e) {
                throw new Error(`Something went wrong during the extension installation.\n\n${e}`);
            }
        }

        if (disabledExtensions.length > 0) {
            return task.newListr(
                disablingExtensions(disabledExtensions)
            );
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = configure;
