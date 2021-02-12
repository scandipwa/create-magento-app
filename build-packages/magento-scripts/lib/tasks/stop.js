const { stopServices } = require('./docker');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { stopPhpFpm } = require('./php-fpm');

const stop = {
    title: 'Stopping project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersionConfig,
        stopPhpFpm,
        stopServices
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx: {
            ...ctx,
            throwMagentoVersionMissing: true
        }
    })
};

module.exports = stop;
