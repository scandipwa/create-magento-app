/* eslint-disable no-param-reassign */
const os = require('os');
const osPlatform = require('../../util/os-platform');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsyncSpawn } = require('../../util/exec-async-command');

const compileOptions = {
    linux: {
        cpuCount: '$(nproc)',
        variants: [
            '+bz2',
            '+bcmath',
            '+ctype',
            '+curl',
            '+intl',
            '+dom',
            '+filter',
            '+hash',
            '+sockets',
            '+iconv',
            '+json',
            '+mbstring',
            '+openssl',
            '+xml',
            '+mysql',
            '+pdo',
            '+soap',
            '+xmlrpc',
            '+xml',
            '+zip',
            '+fpm',
            '+gd'
        ],
        extraOptions: [
            '--with-freetype-dir=/usr/include/freetype2',
            '--with-openssl=/usr/',
            '--with-gd=shared',
            '--with-jpeg-dir=/usr/',
            '--with-png-dir=/usr/'
        ]
    },
    darwin: {
        cpuCount: '$(sysctl -n hw.ncpu)',
        variants: [
            '+neutral',
            '+bz2="$(brew --prefix bzip2)"',
            '+bcmath',
            '+ctype',
            '+curl=$(brew --prefix curl-openssl)',
            '+intl=$(brew --prefix icu4c)',
            '+dom',
            '+filter',
            '+hash',
            '+iconv',
            '+json',
            '+mbstring',
            '+openssl=$(brew --prefix openssl)', // ="$(brew --prefix openssl)"
            '+xml',
            '+mysql',
            '+pdo',
            '+soap',
            '+xmlrpc',
            '+xml',
            '+zip',
            '+fpm',
            '+gd'
        ],
        extraOptions: [
            '--with-zlib-dir=$(brew --prefix zlib)',
            '--with-iconv=$(brew --prefix libiconv)',
            '--with-gd=shared'
        ],
        env: {
            // eslint-disable-next-line max-len
            PKG_CONFIG_PATH: '$PKG_CONFIG_PATH:$(brew --prefix libxml2)/lib/pkgconfig:$(brew --prefix icu4c)/lib/pkgconfig:$(brew --prefix openssl)/lib/pkgconfig:$(brew --prefix curl-openssl)/lib/pkgconfig:$(brew --prefix zlib)/lib/pkgconfig',
            CPATH: '$CPATH:$(brew --prefix openssl)/include'
        }
    }
};

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const compile = {
    title: 'Compiling PHP',
    task: async ({ config: { php } }, task) => {
        const platformCompileOptions = compileOptions[os.platform()];
        if (os.platform() === 'linux') {
            const { dist } = await osPlatform();
            if (dist.includes('Manjaro')) {
                platformCompileOptions.extraOptions.push('--with-libdir=lib64');
            }
        }
        const exportEnv = Object.entries(platformCompileOptions.env || {}).map(([key, value]) => `export ${key}=${value}`).join(' && ');
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
};

module.exports = compile;
