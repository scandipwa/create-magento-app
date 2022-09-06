const containers = require('./containers');
const network = require('./network');
const dockerApi = require('./api');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startServices = () => ({
    title: 'Starting Docker services',
    task: (ctx, task) => task.newListr([
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
    stopServices,
    dockerApi
};
