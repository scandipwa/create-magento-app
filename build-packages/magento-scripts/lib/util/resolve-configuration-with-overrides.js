const path = require('path')
const UnknownError = require('../errors/unknown-error')
const { configFileSchema } = require('./config-file-validator')
const { deepmerge } = require('./deepmerge')
const pathExists = require('./path-exists')

/**
 * @param {import('../../typings/index').CMAConfiguration} configuration
 * @param {string} [projectPath]
 */
const resolveConfigurationWithOverrides = async (
    configuration,
    projectPath = process.cwd()
) => {
    const configJSFilePath = path.join(projectPath, 'cma.js')
    if (await pathExists(configJSFilePath)) {
        /**
         * @type {import('../../typings/index').CMAConfiguration}
         */
        const userConfiguration = require(configJSFilePath)

        try {
            await configFileSchema.validateAsync(userConfiguration)
        } catch (e) {
            throw new UnknownError(
                `Configuration file validation error!\n\n${e.message}`
            )
        }

        const overridenConfiguration = deepmerge(
            configuration,
            userConfiguration
        )
        // let chosenEngine = overridenConfiguration.configuration.searchengine.engine
        // const newSearchEngineConfiguration = {
        //     ...overridenConfiguration.configuration.searchengine,
        //     ...overridenConfiguration.configuration[chosenEngine]
        // }
        // overridenConfiguration.configuration.searchengine = newSearchEngineConfiguration

        return {
            userConfiguration,
            overridenConfiguration
        }
    }

    return {
        userConfiguration: configuration,
        overridenConfiguration: configuration
    }
}

module.exports = resolveConfigurationWithOverrides
