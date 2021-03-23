/* eslint-disable no-param-reassign */
const { allVersions, defaultConfiguration } = require('./versions');
const { getConfigFromMagentoVersion } = require('.');
const getInstalledMagentoVersion = require('../util/get-installed-magento-version');
const sleep = require('../util/sleep');

const getMagentoVersion = {
    // title: 'Loading Magento version',
    task: async (ctx, task) => {
        let { magentoVersion } = ctx;

        if (!magentoVersion) {
            task.title = 'Loading Magento version';
            try {
                magentoVersion = await getInstalledMagentoVersion();
            } catch (e) {
                if (ctx.throwMagentoVersionMissing) {
                    throw e;
                }
                if (allVersions.length === 1) {
                    const { magentoVersion: defaultMagentoVersion } = defaultConfiguration;
                    magentoVersion = defaultMagentoVersion;
                } else {
                    let promptSkipper = false;
                    const timer = async () => {
                        for (let i = 5 * 60; i !== 0; i--) {
                            // eslint-disable-next-line no-await-in-loop
                            await sleep(1000);
                            if (promptSkipper) {
                                return null;
                            }
                            task.title = `Checking app config (${i} sec left...)`;
                        }
                        task.cancelPrompt();
                        return defaultConfiguration.magento;
                    };

                    magentoVersion = await Promise.race([
                        task.prompt({
                            type: 'Select',
                            message: 'Choose Magento Version',
                            name: 'magentoVersion',
                            choices: allVersions.map((version) => (
                                {
                                    name: version.magentoVersion,
                                    message: version.magentoVersion
                                }
                            ))
                        }),
                        timer()
                    ]);

                    promptSkipper = true;
                }
            }
            task.title = `Using Magento ${magentoVersion}`;
        }

        ctx.magentoVersion = magentoVersion;

        ctx.config = await getConfigFromMagentoVersion(magentoVersion);
    }
};

module.exports = getMagentoVersion;
