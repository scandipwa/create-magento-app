const { stopServices } = require('./docker')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
const getProjectConfiguration = require('../config/get-project-configuration')
const checkConfigurationFile = require('../config/check-configuration-file')
const getDockerVersion = require('./requirements/docker/version')

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const stop = () => ({
    title: 'Stopping project',
    task: async (ctx, task) =>
        task.newListr(
            [
                getDockerVersion(),
                getMagentoVersionConfig(),
                checkConfigurationFile(),
                getProjectConfiguration(),
                stopServices()
            ],
            {
                concurrent: false,
                exitOnError: true
            }
        )
})

module.exports = stop
