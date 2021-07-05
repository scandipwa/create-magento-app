/* eslint-disable consistent-return,no-await-in-loop,no-restricted-syntax,no-param-reassign,max-len */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const macosVersion = require('macos-version');

/**
 * Get installed modules list with versions
 * @param {Object} param0
 * @param {import('../../../typings/context').ListrContext['config']['php']} param0.php
 * @returns {Promise<{[key: string]: string}}>}
 */
const getInstalledModules = async ({ php }) => {
    const output = await execAsyncSpawn(`${ php.binPath } -c ${php.iniPath} -r 'foreach (get_loaded_extensions() as $extension) echo "$extension:" . phpversion($extension) . "\n";'`);

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
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const configure = {
    title: 'Configuring PHP extensions',
    task: async ({ config, debug }, task) => {
        const { php, overridenConfiguration: { configuration: { php: { disabledExtensions = [] } } } } = config;
        const loadedModules = await getInstalledModules({ php });
        const missingExtensions = Object.entries(php.extensions)
            // check if module is not loaded and if it is loaded check installed version
            .filter(([name, options]) => {
                const extensionName = options.extensionName || name;
                if (extensionName === 'xdebug' && !debug) {
                    return false;
                }
                if (!loadedModules[extensionName]) {
                    return true;
                }

                if (options && options.version && loadedModules[extensionName] !== options.version) {
                    return true;
                }

                return false;
            });

        if (missingExtensions.length === 0) {
        // if all extensions are installed - do not configure PHP
            task.skip();
            return;
        }

        try {
            for (const [extensionName, extensionOptions] of missingExtensions) {
                const options = macosVersion.isMacOS ? extensionOptions.macOptions : extensionOptions.options;
                const { hooks = {} } = extensionOptions;

                if (hooks.preInstall) {
                    await Promise.resolve(hooks.preInstall(config));
                }
                await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                phpbrew use ${ php.version } && \
                phpbrew ext install ${ extensionName }${ extensionOptions.version ? ` ${extensionOptions.version}` : ''}${ options ? ` -- ${ options }` : ''}`,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                });

                if (hooks.postInstall) {
                    await Promise.resolve(hooks.postInstall(config));
                }
            }
        } catch (e) {
            throw new Error(`Something went wrong during the extension installation.\n\n${e}`);
        }

        if (!debug && loadedModules.xdebug && !disabledExtensions.includes('xdebug')) {
            disabledExtensions.push('xdebug');
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
};

module.exports = configure;
