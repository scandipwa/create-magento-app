const {
    execAsyncSpawn,
    execCommandTask
} = require('../../util/exec-async-command')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkRosetta = () => ({
    skip: (ctx) => !ctx.isArmMac,
    task: async (ctx, task) => {
        task.title = 'Checking Rosetta 2 status'

        const { code } = await execAsyncSpawn('arch -x86_64 echo "test"', {
            withCode: true
        })

        if (code === 1) {
            task.output = 'Rosetta 2 is not installed, installing...'
            return task.newListr(
                execCommandTask(
                    'softwareupdate --install-rosetta --agree-to-license',
                    {
                        pipeInput: true
                    }
                )
            )
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = checkRosetta
