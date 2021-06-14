const checkPlatform = require('./platform');
const checkPhpbrew = require('./phpbrew');
const checkComposer = require('./composer');
const checkDocker = require('./docker');
const checkNodeVersion = require('./node-version');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkRequirements = {
    title: 'Checking requirements',
    task: (ctx, task) => task.newListr([
        // TODO add support for mac
        // checking if user is on supported platform
        checkPlatform,
        // check the PHPBrew installation
        checkPhpbrew,
        // check the Docker installation
        checkDocker,
        // check for COMPOSER_AUTH
        checkComposer,
        // check for Node.js version
        checkNodeVersion
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
};

module.exports = { checkRequirements };
