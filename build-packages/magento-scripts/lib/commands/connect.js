const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { docker } = require('../config');
const connect = require('../tasks/connect');

module.exports = (yargs) => {
    yargs.command('connect <container name> [commands...]', 'Connect to docker container', () => {}, async (argv) => {
        const containers = docker.getContainers();
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
            await connect({
                containerName: container.name,
                commands: argv.commands
            });

            return;
        }

        logger.error(`No container found "${argv.containername}"`);
    });
};
