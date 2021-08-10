const os = require('os');
const osPlatform = require('../../util/os-platform');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const compileOptions = require('./compile-options');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const compile = () => ({
    title: 'Compiling PHP',
    task: async ({ config: { php } }, task) => {
        const platformCompileOptions = compileOptions[os.platform()];
        if (os.platform() === 'linux') {
            const { dist } = await osPlatform();
            if (['Fedora', 'Manjaro'].some((distro) => dist.includes(distro))) {
                platformCompileOptions.extraOptions.push('--with-libdir=lib64');
            }
        }
        const exportEnv = Object.entries(platformCompileOptions.env || {}).map(([key, value]) => `export ${key}="${value}"`).join(' && ');
        const phpCompileCommand = `${exportEnv ? `${exportEnv} && ` : ''} \
        phpbrew install -j ${platformCompileOptions.cpuCount} ${php.version} ${platformCompileOptions.variants.join(' ')} \
        -- ${platformCompileOptions.extraOptions.join(' ')}`;

        try {
            await execAsyncSpawn(
                phpCompileCommand,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                }
            );
        } catch (e) {
            throw new Error(
                `Failed to compile the required PHP version.
                Tried compiling the PHP version ${ logger.style.misc(php.version) }.
                Use your favorite search engine to resolve the issue.
                See error details in the output below.\n\n${e}`
            );
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = compile;
