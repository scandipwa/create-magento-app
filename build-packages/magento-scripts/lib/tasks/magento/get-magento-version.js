/* eslint-disable no-param-reassign */
const { allVersions } = require('../../config/version-config');
const { getConfigFromMagentoVersion } = require('../../config');
const getInstalledMagentoVersion = require('../../util/get-installed-magento-version');
const sleep = require('../../util/sleep');

const getMagentoVersion = {
    title: 'Getting magento version (300 sec left...)',
    task: async (ctx, task) => {
        let magentoVersion;

        try {
            magentoVersion = await getInstalledMagentoVersion();
        } catch (e) {
            if (ctx.throwMagentoVersionMissing) {
                throw e;
            }
            if (allVersions.length === 1) {
                magentoVersion = allVersions[0];
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
                    return allVersions[0];
                };

                magentoVersion = await Promise.race([
                    task.prompt({
                        type: 'Select',
                        message: 'Choose Magento Version',
                        name: 'magentoVersion',
                        choices: allVersions.map((version) => (
                            {
                                name: version,
                                message: version
                            }
                        ))
                    }),
                    timer()
                ]);

                promptSkipper = true;
            }
        }

        ctx.magentoVersion = magentoVersion;
        ctx.config = getConfigFromMagentoVersion(magentoVersion);
        task.title = `Using Magento ${magentoVersion}`;
    }
};

module.exports = getMagentoVersion;
