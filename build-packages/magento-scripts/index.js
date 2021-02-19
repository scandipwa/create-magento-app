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

process.title = 'Create Magento App';

(async () => {
    const { version: currentVersion, name } = require('./package.json');

    try {
        const latestVersion = await getLatestVersion(name);

        if (semver.gt(latestVersion, currentVersion)) {
            logger.warn(
                `${ isGlobal() ? 'Global module' : 'Module' } ${ logger.style.misc(name) } is out-dated.`,
                `Please upgrade it to latest version ${ logger.style.misc(latestVersion) }.`,
                `You can do it by running following command: ${ logger.style.command(`npm i ${ isGlobal() ? '-g' : '' } ${ name }@${ latestVersion }`) }.`
            );
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
