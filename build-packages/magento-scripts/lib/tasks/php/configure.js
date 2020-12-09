/* eslint-disable no-param-reassign */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const macosVersion = require('macos-version');

const configure = {
    title: 'Configuring PHP extensions',
    task: async ({ config: { php } }, task) => {
        const loadedModules = await execAsyncSpawn(`${ php.binPath } -m`);
        const missingExtensions = php.extensions.filter(({ name }) => !loadedModules.includes(name));

        if (missingExtensions.length === 0) {
        // if all extensions are installed - do not configure PHP
            task.skip();
            return;
        }

        try {
            // eslint-disable-next-line no-restricted-syntax
            for (const extension of missingExtensions) {
                const options = macosVersion.isMacOS ? extension.macOptions : extension.options;
                // eslint-disable-next-line no-await-in-loop
                await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                phpbrew use ${ php.version } && \
                phpbrew ext install ${ extension.name }${ options ? ` -- ${ options }` : ''}`,
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
