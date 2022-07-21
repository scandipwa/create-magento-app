const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const checkConfigurationFile = require('../config/check-configuration-file');
const getProjectConfiguration = require('../config/get-project-configuration');
const executeInContainer = require('../tasks/execute');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { checkRequirements } = require('../tasks/requirements');
const { getCachedPorts } = require('../config/get-port-config');

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
- elasticsearch
- varnish (if enabled)
- sslTerminator`);
        },
        async (argv) => {
            const tasks = new Listr([
                checkRequirements(),
                getMagentoVersionConfig(),
                checkConfigurationFile(),
                getProjectConfiguration(),
                getCachedPorts()
            ], {
                concurrent: false,
                exitOnError: true,
                ctx: { throwMagentoVersionMissing: true },
                rendererOptions: { collapse: false, clearOutput: true }
            });

            let ctx;
            try {
                ctx = await tasks.run();
            } catch (e) {
                logger.error(e.message || e);
                process.exit(1);
            }
            const containers = ctx.config.docker.getContainers(ctx.ports);
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

                logger.logN(`Executing container ${logger.style.misc(container._)} (command: ${logger.style.command(argv.commands[0])})`);
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
