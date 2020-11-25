/* eslint-disable no-param-reassign */
const os = require('os');
const osPlatform = require('../../util/os-platform');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
// const macosVersion = require('macos-version');
const { execAsyncSpawn } = require('../../util/exec-async-command');

const compile = {
    title: 'Compiling PHP',
    task: async ({ config: { php } }, task) => {
        let phpCompileCommand;
        if (os.platform() === 'darwin') {
            phpCompileCommand = `phpbrew install -j $(sysctl -n hw.ncpu) ${php.version} +bz2="$(brew --prefix bzip2)" \
            +bcmath +ctype +curl +intl=$(brew --prefix icu4c) +dom +filter +hash +json +mbstring +openssl="$(brew --prefix openssl)" +xml \
            +mysql +pdo +soap +xmlrpc +xml \
            +zip +fpm +gd -- \
            --with-zlib-dir=$(brew --prefix zlib) \
            --with-iconv=$(brew --prefix libiconv) \
            --enable-zip \
            --with-gd=shared`;
        } else {
            phpCompileCommand = `phpbrew install -j $(nproc) ${ php.version } \
        +bz2 +bcmath +ctype +curl +intl +dom +filter +hash +sockets \
        +iconv +json +mbstring +openssl +xml +mysql \
        +pdo +soap +xmlrpc +xml +zip +fpm +gd \
        -- --with-freetype-dir=/usr/include/freetype2 --with-openssl=/usr/ \
        --with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/`;
            const { dist } = await osPlatform();
            if (dist.includes('Manjaro')) {
                phpCompileCommand += ' --with-libdir=lib64';
            }
        }
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
            task.report(e);

            throw new Error(
                `Failed to compile the required PHP version.
                Tried compiling the PHP version ${ logger.style.misc(php.version) }.
                Use your favorite search engine to resolve the issue.
                Most probably you are missing some dependencies.
                See error details in the output below.\n\n${e}`
            );

            // logger.note(
            //     'We would appreciate an issue on GitHub :)'
            // );
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = compile;
