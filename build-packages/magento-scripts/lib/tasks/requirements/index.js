const checkPlatform = require('./platform');
const { checkComposerCredentials } = require('./composer-credentials');
const checkDocker = require('./docker');
const checkNodeVersion = require('./node-version');
// const checkPHPVersion = require('./php-version');
const checkRosetta = require('./rosetta');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkRequirements = () => ({
    title: 'Checking requirements',
    task: (ctx, task) => task.newListr([
        // check if rosetta 2 is installed or not on m1 macs
        checkRosetta(),
        // checking if user is on supported platform
        checkPlatform(),
        // check the Docker installation
        checkDocker(),
        // check for Node.js version
        checkNodeVersion(),
        // check installed PHP version
        // checkPHPVersion(),
        // check for COMPOSER_AUTH or auth.json
        // localAuthJson(),
        checkComposerCredentials()
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false,
            showTimer: false
        }
    }),
    options: {
        showTimer: false
    }
});

module.exports = { checkRequirements };
