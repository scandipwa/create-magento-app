#!/usr/bin/env node

const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const semver = require('semver')
const isInstalledGlobally = require('is-installed-globally')
const isRunningRoot = require('./lib/util/is-running-root')
const { executeTask } = require('./lib/tasks/execute')

if (isRunningRoot()) {
    logger.error('Root privileges detected!')
    console.log(`
We detected that you are running ${logger.style.misc(
        'magento-scripts'
    )} as root user.
We cannot allow you to run ${logger.style.misc(
        'magento-scripts'
    )} with root privileges, this will only cause more problems.

If you are experiencing problems with ${logger.style.misc(
        'Docker'
    )} or ${logger.style.misc('Magento')} setup, running ${logger.style.misc(
        'magento-scripts'
    )} as root will not solve those problems.
`)

    process.exit(1)
}

process.title = 'magento-scripts'

/**
 * @param {String} latestVersion
 * @param {String} currentVersion
 * @returns {Boolean}
 */
const newVersionIsAPatch = (latestVersion, currentVersion) => {
    const latestVersionParsed = semver.parse(latestVersion)
    const currentVersionParsed = semver.parse(currentVersion)

    return Boolean(
        latestVersionParsed &&
            currentVersionParsed &&
            latestVersionParsed.major === currentVersionParsed.major &&
            latestVersionParsed.minor === currentVersionParsed.minor &&
            latestVersionParsed.patch !== currentVersionParsed.patch
    )
}

;(async () => {
    const { version: currentVersion, name } = require('./package.json')
    try {
        const latestVersion = await getLatestVersion(name)

        if (semver.gt(latestVersion, currentVersion)) {
            const isNewVersionAPath = newVersionIsAPatch(
                latestVersion,
                currentVersion
            )

            let message = []

            if (isNewVersionAPath) {
                message = [
                    `A patch for ${logger.style.misc(name)} is available!`,
                    `We recommend to update to latest version ${logger.style.misc(
                        latestVersion
                    )}!`,
                    `-> ${logger.style.command(
                        `npm i ${
                            isInstalledGlobally ? '-g ' : ''
                        }${name}@${latestVersion}`
                    )}`
                ]
            } else {
                message = [
                    `${
                        isInstalledGlobally ? 'Global module' : 'Module'
                    } ${logger.style.misc(
                        name
                    )} (${currentVersion}) is out-dated.`,
                    `Please upgrade it to latest version ${logger.style.misc(
                        latestVersion
                    )}.`,
                    `You can do it by running the following command: ${logger.style.command(
                        `npm i ${
                            isInstalledGlobally ? '-g ' : ''
                        }${name}@${latestVersion}`
                    )}.`
                ]
            }

            process.isOutOfDateVersion = true
            process.isOutOfDateVersionMessage = message
        }
    } catch (e) {
        logger.warn(`Package ${logger.style.misc(name)} is not yet published.`)
        logger.log() // add empty line
    }

    const [containerName, ...commands] = process.argv.slice(2)

    return executeTask({
        containerName,
        commands
    })
})()
