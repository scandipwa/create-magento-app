const checkPlatform = require('./platform');
const checkPHPbrew = require('./phpbrew');
const checkComposer = require('./composer');
const checkDocker = require('./docker');
const checkNodeVersion = require('./node-version');
const checkPHPVersion = require('./php-version');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkRequirements = () => ({
    title: 'Checking requirements',
    task: (ctx, task) => task.newListr([
        // checking if user is on supported platform
        checkPlatform(),
        // check the PHPBrew installation
        checkPHPbrew(),
        // check installed PHP version
        checkPHPVersion(),
        // check the Docker installation
        checkDocker(),
        // check for COMPOSER_AUTH or auth.json
        // localAuthJson(),
        checkComposer(),
        // check for Node.js version
        checkNodeVersion()
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
