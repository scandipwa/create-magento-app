const { execAsyncSpawn } = require('../../../util/exec-async-command')
const { getBrewCommand } = require('../../../util/get-brew-bin-path')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installDockerOnMac = () => ({
    title: 'Installing Docker on Mac OS',
    task: async (ctx, task) => {
        const interval = !ctx.verbose
            ? setInterval(() => {
                  task.output = `Installing Docker on Mac... Yep, still in progress ${new Date().toUTCString()}`
              }, 5000)
            : null

        await execAsyncSpawn(
            `${await getBrewCommand({ native: true })} install --cask docker`,
            {
                callback: !ctx.verbose
                    ? undefined
                    : (t) => {
                          task.output = t
                      }
            }
        )

        if (!ctx.verbose && interval) {
            clearInterval(interval)
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = installDockerOnMac
