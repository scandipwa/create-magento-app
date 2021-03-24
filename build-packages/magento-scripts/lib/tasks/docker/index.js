const containers = require('./containers');
const network = require('./network');
const volumes = require('./volumes');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startServices = {
    title: 'Starting docker services',
    task: async (ctx, task) => task.newListr([
        {
            title: 'Prepare services',
            task: (ctx, task) => task.newListr([
                network.createNetwork,
                volumes.createVolumes,
                containers.pullContainers
            ], {
                concurrent: true,
                exitOnError: true,
                ctx
            })
        },
        containers.startContainers
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    })
};

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stopServices = {
    title: 'Stopping Docker services',
    task: async (ctx, task) => task.newListr([
        containers.stopContainers
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    })
};

module.exports = {
    startServices,
    stopServices
};
