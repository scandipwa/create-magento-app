const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { docker } = require('../config');
const { execAsyncSpawn } = require('../util/exec-async-command');

module.exports = (yargs) => {
    yargs.command('logs <scope>', 'Display application logs.', () => {}, async (argv) => {
        const containers = docker.getContainers();
        const services = Object.keys(containers);

        if (services.includes(argv.scope)) {
            const { result } = await execAsyncSpawn(`docker logs ${containers[argv.scope].name} -f`, {
                withCode: true
            });

            logger.log(result);
            return;
        }

        if (argv.scope === 'magento') {
            await execAsyncSpawn('tail -f var/log/system.log', {
                callback: logger.log
            });

            return;
        }

        logger.error(`No service found "${argv.scope}"`);
    });
};
