const os = require('os')
const fs = require('fs')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const pathExists = require('../../../util/path-exists')
const executeSudoCommand = require('../../../util/execute-sudo-command')

const dockerSocketPath = '/var/run/docker.sock'

const fixCommand = `sudo chmod 666 ${dockerSocketPath}`

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerSocketPermissions = () => ({
    title: 'Checking Docker permissions',
    // skip check if socket does not exist
    skip: async () => !(await pathExists(dockerSocketPath)),
    task: async (ctx, task) => {
        try {
            await fs.promises.access(dockerSocketPath, fs.constants.R_OK)
        } catch (e) {
            // check for permission
            if (Math.abs(e.errno) === Math.abs(os.constants.errno.EACCES)) {
                const confirmPrompt = await task.prompt({
                    type: 'Confirm',
                    message: `We detected that your Docker socket, located in ${logger.style.file(
                        dockerSocketPath
                    )}, have permissions set, that prevents user (${logger.style.misc(
                        os.userInfo().username
                    )}) from accessing it.

We can fix it by running the following command: ${logger.style.command(
                        fixCommand
                    )}

Would you like to fix this permission issue?

Otherwise installation will likely fail.`
                })

                if (confirmPrompt) {
                    return task.newListr(executeSudoCommand(fixCommand))
                }
                task.skip(
                    `Permission issue detected in ${logger.style.file(
                        dockerSocketPath
                    )} but user decided not to fix it.`
                )
            }
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = {
    checkDockerSocketPermissions
}
