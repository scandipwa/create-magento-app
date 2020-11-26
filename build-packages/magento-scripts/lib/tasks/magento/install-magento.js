/* eslint-disable no-param-reassign */
const path = require('path');
const runComposerCommand = require('../../util/run-composer');
const matchFilesystem = require('../../util/match-filesystem');
const { pathExists } = require('fs-extra');

const installMagento = {
    title: 'Installing Magento',
    task: async ({ magentoVersion, config: { config } }, task) => {
        const isFsMatching = await matchFilesystem(config.magentoDir, {
            'app/etc': [
                'env.php'
            ],
            'bin/magento': true,
            'composer.json': true,
            'composer.lock': true
        });

        if (isFsMatching) {
            task.skip();
            return;
        }

        task.title = 'Creating Magento project...';
        const composerJsonExists = await pathExists(path.join(config.magentoDir, 'composer.json'));
        if (!composerJsonExists) {
            throw new Error('Composer.json file not found');
        }

        await runComposerCommand('install',
            {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });

        task.title = 'Magento installed!';
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installMagento;
