// const os = require('os');
const { prompt } = require('enquirer')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const execAsync = require('../exec-async')
const dependenciesForPlatforms = require('./dependencies-for-platforms')

/**
 * Install dependencies
 * @param {object} options
 * @param {keyof dependenciesForPlatforms} options.platform Platform
 * @param {string[]} options.dependenciesToInstall List of dependencies to install
 */
const installDependencies = async (options) => {
    const { dependenciesToInstall, platform } = options
    const cmd = dependenciesForPlatforms[platform].installCommand(
        dependenciesToInstall.join(' ')
    )
    const installCommand = logger.style.code(cmd)
    const dependenciesWordFormatter = `dependenc${
        dependenciesToInstall.length > 1 ? 'ies' : 'y'
    }`
    logger.logN(
        `Missing ${dependenciesWordFormatter} ${logger.style.code(
            dependenciesToInstall.join(', ')
        )} detected!`
    )
    logger.logN('These dependencies required for CMA to operate!')

    const { installAnswer } = await prompt({
        type: 'select',
        message: `Do you want to install missing ${dependenciesWordFormatter} now?`,
        name: 'installAnswer',
        choices: [
            {
                name: 'install',
                message: `Install ${dependenciesWordFormatter} now!`
            },
            {
                name: 'not-install',
                message: `Install ${dependenciesWordFormatter} later, when I feel it.`
            }
        ]
    })

    if (installAnswer === 'not-install') {
        throw new Error(`Okay, skipping ${dependenciesWordFormatter} installation for now.

To install missing ${dependenciesWordFormatter} manually, run the following command: ${installCommand}`)
    }

    if (installAnswer === 'install') {
        // on macos we don't need sudo permissions to install dependencies, so every other platform required to do that
        // if (platform !== 'darwin') {
        //     logger.logN(`Enter your sudo password! It's needed for ${ dependenciesWordFormatter } installation.`);
        //     logger.logN(logger.style.command(`>[sudo] password for ${ os.userInfo().username }:`));
        // }

        await execAsync(cmd, {
            callback: logger.log,
            pipeInput: true
        })
    }
}

module.exports = installDependencies
