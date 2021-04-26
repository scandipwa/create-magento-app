/* eslint-disable no-await-in-loop,no-restricted-syntax,no-param-reassign,max-len */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const macosVersion = require('macos-version');

/**
 * Get installed modules list with versions
 * @param {*} param0
 * @param {Object} param0.php
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
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const configure = {
    title: 'Configuring PHP extensions',
    task: async ({ config }, task) => {
        const { php } = config;
        const loadedModules = await getInstalledModules({ php });
        const missingExtensions = Object.entries(php.extensions)
            // check if module is not loaded and if it is loaded check installed version
            .filter(([name, options]) => {
                const moduleName = options.moduleName || name;
                if (!loadedModules[moduleName]) {
                    return true;
                }

                if (options && options.version && loadedModules[moduleName] !== options.version) {
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
                    await hooks.preInstall(config);
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
                    await hooks.postInstall(config);
                }
            }
        } catch (e) {
            throw new Error(`Something went wrong during the extension installation.\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = configure;
