const { systemctlControl } = require('../../../util/systemctl');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerStatus = () => ({
    title: 'Checking Docker status',
    task: async (ctx, task) => {
        const dockerService = systemctlControl('docker');

        const isRunning = await dockerService.isRunning();
        const isEnabled = await dockerService.isEnabled();

        if (!isEnabled && !isRunning) {
            const dockerStartConfirmation = await task.prompt({
                type: 'Confirm',
                message: `Looks like Docker is not enabled and not running, would you like to enable and run it?

This action requires root privileges.`
            });

            if (dockerStartConfirmation) {
                await dockerService.enableAndStart();

                return;
            }
        } else if (!isRunning) {
            const dockerStartConfirmation = await task.prompt({
                type: 'Confirm',
                message: `Looks like Docker is not running, would you like to run it?

This action requires root privileges.`
            });

            if (dockerStartConfirmation) {
                await dockerService.start();

                return;
            }
        }

        task.skip('User skipped running Docker');
    }
});

module.exports = checkDockerStatus;
