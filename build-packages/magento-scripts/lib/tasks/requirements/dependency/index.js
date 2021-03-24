/* eslint-disable consistent-return */
const os = require('os');
const osPlatform = require('../../../util/os-platform');
const archDependenciesCheck = require('./arch');
const fedoraDependenciesCheck = require('./fedora');
const ubuntuDependenciesCheck = require('./ubuntu');
const macDependenciesCheck = require('./mac');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const dependencyCheck = {
    task: async (ctx, task) => {
        const currentPlatform = os.platform();

        if (currentPlatform === 'darwin') {
            return task.newListr([macDependenciesCheck]);
        }

        const { dist } = await osPlatform();
        switch (dist) {
        case 'Arch Linux':
        case 'Manjaro': {
            return task.newListr([archDependenciesCheck]);
        }
        case 'Fedora':
        case 'CentOS': {
            return task.newListr([fedoraDependenciesCheck]);
        }
        case 'Linux Mint':
        case 'Ubuntu': {
            return task.newListr([ubuntuDependenciesCheck]);
        }
        default: {
            //
        }
        }
    }
};

module.exports = dependencyCheck;
