const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { docker } = require('../config');
const connect = require('../tasks/connect');

module.exports = (yargs) => {
    yargs.command('connect <container name> <shell>', 'Connect to docker container', () => {}, async (argv) => {
        const containers = docker.getContainers();
        const services = Object.keys(containers);

        if (services.includes(argv.containername) || services.some((service) => service.includes(argv.containername))) {
            const name = containers[argv.containername]
                ? containers[argv.containername].name
                : Object.entries(containers).find(([key]) => key.includes(argv.containername))[1].name;

            await connect({
                containerName: name,
                shell: argv.shell
            });

            return;
        }

        logger.error(`No container found "${argv.containername}"`);
    });
};
