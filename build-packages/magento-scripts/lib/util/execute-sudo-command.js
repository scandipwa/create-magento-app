const os = require('os')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { execCommandTask } = require('./exec-async-command')

/**
 * @type {<T extends boolean>(command: string, options?: Omit<import('../util/exec-async-command').ExecAsyncSpawnOptions<T>, 'pipeInput'>) => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const executeSudoCommand = (command, options = {}) => ({
    task: async (ctx, task) => {
        task.output = 'Enter your sudo password!'
        task.output = logger.style.command(
            `>[sudo] password for ${os.userInfo().username}:`
        )

        return task.newListr(
            execCommandTask(command, {
                pipeInput: true,
                ...options
            })
        )
    },
    options: {
        bottomBar: 10
    }
})

module.exports = executeSudoCommand
