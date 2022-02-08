const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { docker } = require('../config');
const executeInContainer = require('../tasks/execute');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'exec <container name> [commands...]',
        'Execute command in docker container',
        (yargs) => {
            yargs.usage(`Usage: npm run exec <container name> [commands...]

Available containers:
- mysql
- nginx
- redis
- elasticsearch`);
        },
        async (argv) => {
            const containers = (await docker).getContainers();
            const services = Object.keys(containers);

            if (services.includes(argv.containername) || services.some((service) => service.includes(argv.containername))) {
                const container = containers[argv.containername]
                    ? containers[argv.containername]
                    : Object.entries(containers).find(([key]) => key.includes(argv.containername))[1];

                if (argv.commands.length === 0) {
                // if we have default connect command then use it
                    if (container.connectCommand) {
                    // eslint-disable-next-line no-param-reassign
                        argv.commands = container.connectCommand;
                    } else {
                    // otherwise fall back to bash (if it exists inside container)
                        argv.commands.push('bash');
                    }
                }
                await executeInContainer({
                    containerName: container.name,
                    commands: argv.commands
                });

                return;
            }

            logger.error(`No container found "${argv.containername}"`);
        }
    );
};
