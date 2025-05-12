const checkPlatform = require('./platform')
const { checkComposerCredentials } = require('./composer-credentials')
const localAuthJson = require('../composer/local-auth-json')
const checkDocker = require('./docker')
const checkNodeVersion = require('./node-version')
const checkRosetta = require('./rosetta')
const checkCGroupVersion = require('./cgroup-version')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkRequirements = () => ({
    title: 'Checking requirements',
    task: (ctx, task) =>
        task.newListr(
            [
                // check if rosetta 2 is installed or not on m1 macs
                checkRosetta(),
                // checking if user is on supported platform
                checkPlatform(),
                // check the Docker installation
                checkDocker(),
                // check if cgroup v2 is used
                checkCGroupVersion(),
                // check for Node.js version
                checkNodeVersion(),
                // check for COMPOSER_AUTH or auth.json
                localAuthJson(),
                checkComposerCredentials()
            ],
            {
                concurrent: false,
                exitOnError: true,
                rendererOptions: {
                    collapse: false,
                    showTimer: false
                }
            }
        ),
    options: {
        showTimer: false
    }
})

module.exports = { checkRequirements }
