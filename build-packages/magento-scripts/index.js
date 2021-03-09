#!/usr/bin/env node

const yargs = require('yargs');
const getLatestVersion = require('@scandipwa/scandipwa-dev-utils/latest-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const isGlobal = require('./lib/util/is-global');

const commands = [
    require('./lib/commands/link'),
    require('./lib/commands/logs'),
    require('./lib/commands/cli'),
    require('./lib/commands/start'),
    require('./lib/commands/stop'),
    require('./lib/commands/cleanup'),
    require('./lib/commands/status'),
    require('./lib/commands/execute')
];

process.title = 'magento-scripts';

(async () => {
    const { version: currentVersion, name } = require('./package.json');

    try {
        const latestVersion = await getLatestVersion(name);

        if (semver.gt(latestVersion, currentVersion, { includePrerelease: true })) {
            const isLatestVersionPreRelease = Boolean(semver.prerelease(latestVersion));
            const isCurrentVersionPreRelease = Boolean(semver.prerelease(currentVersion));
            const isInstalledGlobally = isGlobal();

            let warnMessage = [];

            if (!isLatestVersionPreRelease) {
                warnMessage = [
                    `${ isInstalledGlobally ? 'Global module' : 'Module' } ${ logger.style.misc(name) } is out-dated.`,
                    `Please upgrade it to latest version ${ logger.style.misc(latestVersion) }.`,
                    `You can do it by running the following command: ${ logger.style.command(`npm i ${ isInstalledGlobally ? '-g ' : '' }${ name }@${ latestVersion }`) }.`
                ];
            } else {
                warnMessage = [
                    `${ isInstalledGlobally ? 'Global module' : 'Module' } ${ logger.style.misc(name) } have a pre-release version ${ logger.style.misc(latestVersion) }`,
                    `You are currently using ${!isCurrentVersionPreRelease ? 'stable' : ''} version ${ logger.style.misc(currentVersion) }.`,
                    `If you want to participate in testing of next stable release you can install prerelease version ${ logger.style.misc(latestVersion) } using the following command:`,
                    `${ logger.style.command(`npm i ${ isInstalledGlobally ? '-g ' : '' }${ name }@${ latestVersion }`) }.`,
                    '',
                    `Waiting for your feedback at ${ logger.style.link('https://github.com/scandipwa/create-magento-app/issues') }!`
                ];
            }

            logger.warn(...warnMessage);
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
