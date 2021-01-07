const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { docker } = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

module.exports = (yargs) => {
    yargs.command('logs <scope>', 'Display application logs.', () => {}, async (argv) => {
        const containers = docker.getContainers();
        const services = Object.keys(containers);

        if (services.includes(argv.scope) || services.some((service) => service.includes(argv.scope))) {
            const containerName = containers[argv.scope] ? argv.scope : Object.keys(containers).find((key) => key.includes(argv.scope));
            await execAsyncSpawn(`docker logs ${containers[containerName].name} -f`, {
                callback: logger.log
            });

            return;
        }

        if (argv.scope === 'magento' || 'magento'.includes(argv.scope)) {
            await execAsyncSpawn('tail -f var/log/system.log', {
                callback: logger.log
            });

            return;
        }

        logger.error(`No service found "${argv.scope}"`);
        process.exit(1);
    });
};
