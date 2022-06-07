const path = require('path');
const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { cmaGlobalConfig } = require('../../config/cma-config');
const downloadFile = require('../../util/download-file');
const { execCommandTask } = require('../../util/exec-async-command');
const { getEnabledExtensions } = require('./extensions');

const libsodiumArchiveUrl = 'https://download.libsodium.org/libsodium/releases/libsodium-1.0.18-stable.tar.gz';

const HAS_LIBSODIUM_BEEN_INSTALLED = 'hasLibsodiumBeenInstalled';

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installSodiumExtension = () => ({
    skip: async (ctx) => {
        if (ctx.isArmMac) {
            if (cmaGlobalConfig.has(HAS_LIBSODIUM_BEEN_INSTALLED)) {
                const hasLibsodiumBeenInstalled = cmaGlobalConfig.get(HAS_LIBSODIUM_BEEN_INSTALLED);
                return hasLibsodiumBeenInstalled;
            }

            return false;
        }

        return true;
    },
    task: async (ctx, task) => {
        task.title = 'Preparing libsodium to installation';
        const tempDir = os.tmpdir();
        const destination = path.join(tempDir, path.parse(libsodiumArchiveUrl).base);
        const extractedArchivePath = path.join(tempDir, 'libsodium-stable');
        const enabledExtensions = await getEnabledExtensions(ctx.config);

        if (enabledExtensions.sodium !== undefined) {
            cmaGlobalConfig.set(HAS_LIBSODIUM_BEEN_INSTALLED, true);
            task.skip();
            return;
        }

        return task.newListr([
            {
                title: 'Downloading archive',
                task: async () => {
                    await downloadFile(libsodiumArchiveUrl, { destination });
                }
            },
            {
                ...execCommandTask(`tar -zxf ${destination}`, {
                    cwd: tempDir
                }),
                title: 'Extracting archive'
            },
            execCommandTask('./configure', {
                cwd: extractedArchivePath
            }),
            execCommandTask('make && make check', {
                cwd: extractedArchivePath
            }),
            {
                title: 'Installing...',
                task: async (ctx, task) => {
                    task.output = 'Enter your sudo password!';
                    task.output = logger.style.command(`>[sudo] password for ${ os.userInfo().username }:`);

                    return task.newListr(
                        execCommandTask('sudo make install', {
                            callback: (t) => {
                                task.output = t;
                            },
                            pipeInput: true,
                            cwd: extractedArchivePath
                        })
                    );
                },
                options: {
                    bottomBar: 10
                }
            },
            {
                task: () => {
                    cmaGlobalConfig.set(HAS_LIBSODIUM_BEEN_INSTALLED, true);
                }
            }
        ]);
    },
    options: {
        bottomBar: 10
    }
});

module.exports = installSodiumExtension;
