const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const os = require('os');
const path = require('path');
const fs = require('fs');
const semver = require('semver');
const { baseConfig } = require('../../config');
const getJsonfileData = require('../../util/get-jsonfile-data');
const pathExists = require('../../util/path-exists');
const runComposerCommand = require('../../util/run-composer');

const globalComposerJsonPath = path.join(os.homedir(), '.config', 'composer', 'composer.json');
const localComposerJsonPath = path.join(baseConfig.magentoDir, 'composer.json');
const prestissimoPluginName = 'hirak/prestissimo';

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const prestissimoInstall = () => ({
    title: 'Installing Prestissimo',
    task: async (ctx, task) => {
        const { magentoVersion, composerVersion } = ctx;

        if (semver.satisfies(composerVersion, '^2')) {
            if (await pathExists(globalComposerJsonPath) && semver.satisfies(composerVersion, '^2.2.0')) {
                const globalComposerJsonData = await getJsonfileData(globalComposerJsonPath);
                const hasPrestissimoInstalled = globalComposerJsonData
                    && globalComposerJsonData.require
                    && !!globalComposerJsonData.require[prestissimoPluginName];

                if (await pathExists(localComposerJsonPath)) {
                    const localComposerJsonData = await getJsonfileData(localComposerJsonPath);

                    if (
                        hasPrestissimoInstalled
                            && localComposerJsonData
                            && localComposerJsonData.config
                            && localComposerJsonData.config['allow-plugins']
                            && typeof localComposerJsonData.config['allow-plugins'][prestissimoPluginName] !== 'boolean'
                    ) {
                        const disableConfirmation = await task.prompt({
                            type: 'Select',
                            message: `We noticed that you have Composer ${ctx.composerVersion}, but you have ${logger.style.code(prestissimoPluginName)} installed, which is used only in Composer 1.
Would you like to disable it in your project?`,
                            choices: [
                                {
                                    name: 'disable',
                                    message: 'Disable it, thanks'
                                },
                                {
                                    name: 'skip',
                                    message: 'Skip this step'
                                }
                            ]
                        });

                        if (disableConfirmation === 'disable') {
                            localComposerJsonData.config['allow-plugins'][prestissimoPluginName] = false;
                            await fs.promises.writeFile(localComposerJsonPath, JSON.stringify(localComposerJsonData, null, 4), 'utf-8');
                        }
                    }
                }
            }
            task.skip();
            return;
        }
        const { code } = await runComposerCommand(`global show ${prestissimoPluginName}`, {
            throwNonZeroCode: false,
            magentoVersion
        });

        if (code === 0) {
            task.skip();
            return;
        }

        await runComposerCommand(`global require ${prestissimoPluginName}`, {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
});

module.exports = prestissimoInstall;
