const containers = require('./containers')
const network = require('./network')
const volume = require('./volume')
const dockerApi = require('./api')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startServices = () => ({
    title: 'Starting Docker services',
    task: (ctx, task) =>
        task.newListr(
            [
                containers.startContainers(),
                containers.checkContainersAreRunning()
            ],
            {
                concurrent: false,
                exitOnError: true
            }
        )
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stopServices = () => ({
    title: 'Stopping Docker services',
    task: (ctx, task) =>
        task.newListr([
            containers.stopContainers(),
            volume.removeLocalVolumes(),
            network.tasks.removeNetwork()
        ])
})

module.exports = {
    startServices,
    stopServices,
    dockerApi
}
