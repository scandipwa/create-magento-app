/* eslint-disable no-param-reassign,max-len */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const macosVersion = require('macos-version');

const configure = {
    title: 'Configuring PHP extensions',
    task: async ({ config: { php } }, task) => {
        const loadedModules = await execAsyncSpawn(`${ php.binPath } -c ${php.iniPath} -m`);
        const missingExtensions = Object.entries(php.extensions)
            .filter(([name]) => !loadedModules.includes(name));

        if (missingExtensions.length === 0) {
        // if all extensions are installed - do not configure PHP
            task.skip();
            return;
        }

        try {
            // eslint-disable-next-line no-restricted-syntax
            for (const [extensionName, extensionOptions] of missingExtensions) {
                const options = macosVersion.isMacOS ? extensionOptions.macOptions : extensionOptions.options;
                // eslint-disable-next-line no-await-in-loop
                await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                phpbrew use ${ php.version } && \
                phpbrew ext install ${ extensionName }${ extensionOptions.version ? ` ${extensionOptions.version}` : ''}${ options ? ` -- ${ options }` : ''}`,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                });
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
