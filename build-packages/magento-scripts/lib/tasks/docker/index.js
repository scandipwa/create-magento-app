const containers = require('./containers');
const network = require('./network');
const volumes = require('./volumes');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startServices = () => ({
    title: 'Starting Docker services',
    task: (ctx, task) => task.newListr([
        network.tasks.createNetwork(),
        volumes.createVolumes(),
        containers.startContainers(),
        containers.checkContainersAreRunning()
    ], {
        concurrent: false,
        exitOnError: true
    })
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stopServices = () => ({
    task: (ctx, task) => task.newListr([
        containers.stopContainers(),
        network.tasks.removeNetwork()
    ])
});

module.exports = {
    startServices,
    stopServices
};
