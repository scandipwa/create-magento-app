#!/usr/bin/env node

const yargs = require('yargs');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const isInstalledGlobally = require('is-installed-globally');

const commands = [
    require('./lib/commands/link'),
    require('./lib/commands/logs'),
    require('./lib/commands/cli'),
    require('./lib/commands/start'),
    require('./lib/commands/stop'),
    require('./lib/commands/cleanup'),
    require('./lib/commands/status'),
    require('./lib/commands/execute'),
    require('./lib/commands/import-db')
];

process.title = 'magento-scripts';

const newVersionIsAPatch = (latestVersion, currentVersion) => {
    const latestVersionParsed = semver.parse(latestVersion);
    const currentVersionParsed = semver.parse(currentVersion);

    return latestVersionParsed.major === currentVersionParsed.major
    && latestVersionParsed.minor === currentVersionParsed.minor
    && latestVersionParsed.patch !== currentVersionParsed.patch;
};

(async () => {
    const { version: currentVersion, name } = require('./package.json');
    try {
        const latestVersion = await getLatestVersion(name);

        if (semver.gt(latestVersion, currentVersion)) {
            const isNewVersionAPath = newVersionIsAPatch(latestVersion, currentVersion);

            let message = [];

            if (isNewVersionAPath) {
                message = [
                    `A patch for ${ logger.style.misc(name) } is available!`,
                    `We recommend to update to latest version ${ logger.style.misc(latestVersion) }!`,
                    `-> ${ logger.style.command(`npm i ${ isInstalledGlobally ? '-g ' : '' }${ name }@${ latestVersion }`) }`
                ];
            } else {
                message = [
                    `${ isInstalledGlobally ? 'Global module' : 'Module' } ${ logger.style.misc(name) } (${currentVersion}) is out-dated.`,
                    `Please upgrade it to latest version ${ logger.style.misc(latestVersion) }.`,
                    `You can do it by running the following command: ${ logger.style.command(`npm i ${ isInstalledGlobally ? '-g ' : '' }${ name }@${ latestVersion }`) }.`
                ];
            }

            const doNotLogOutOfDateCommands = ['start'];

            if (!yargs.argv._.some((arg) => doNotLogOutOfDateCommands.includes(arg))) {
                logger.warn(...message);
            }
            process.isOutOfDateVersion = true;
            process.isOutOfDateVersionMessage = message;
        }
    } catch (e) {
        logger.warn(`Package ${ logger.style.misc(name) } is not yet published.`);
        logger.log(); // add empty line
    }

    yargs.scriptName('magento-scripts');

    // Initialize program commands
    commands.forEach((command) => command(yargs));

    // eslint-disable-next-line no-unused-expressions
    yargs.argv;
})();
