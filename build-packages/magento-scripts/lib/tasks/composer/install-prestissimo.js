/* eslint-disable no-param-reassign */
const semver = require('semver');
const runComposerCommand = require('../../util/run-composer');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const prestissimoInstall = {
    title: 'Installing Prestissimo',
    task: async ({ magentoVersion, config }, task) => {
        const { composer } = config;

        if (semver.satisfies(composer.version, '^2')) {
            task.skip();
            return;
        }
        const { code } = await runComposerCommand('global show hirak/prestissimo', {
            throwNonZeroCode: false,
            magentoVersion
        });

        if (code === 0) {
            task.skip();
            return;
        }

        await runComposerCommand('global require hirak/prestissimo', {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

module.exports = prestissimoInstall;
