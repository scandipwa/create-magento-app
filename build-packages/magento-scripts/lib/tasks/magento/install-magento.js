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

        try {
            await runComposerCommand('install',
                {
                    magentoVersion,
                    callback: (t) => {
                        task.output = t;
                    }
                });
        } catch (e) {
            if (e.message.includes('man-in-the-middle attack')) {
                throw new Error(`Probably you haven't setup pubkeys in composer.
                Please run composer diagnose in cli to get mode.\n\n${e}`);
            }

            throw new Error(`Unexpected error during composer install.\n\n${e}`);
        }
        task.title = 'Magento installed!';
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installMagento;
