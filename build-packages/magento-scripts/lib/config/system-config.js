const os = require('os')
const path = require('path')
const fs = require('fs')
const pathExists = require('../util/path-exists')
const { systemConfigurationSchema } = require('../util/config-file-validator')
const { deepmerge } = require('../util/deepmerge')
const pathExistsSync = require('../util/path-exists-sync')
const KnownError = require('../errors/known-error')

const defaultSystemConfig = {
    analytics: true,
    useNonOverlappingPorts: false
}
const systemConfigPath = path.join(os.homedir(), '.cmarc')

/**
 * @returns {Promise<typeof defaultSystemConfig>}
 */
const getSystemConfig = async ({ validate = true } = {}) => {
    if (await pathExists(systemConfigPath)) {
        const userSystemConfig = await fs.promises.readFile(
            systemConfigPath,
            'utf-8'
        )
        let userSystemConfigParsed
        try {
            userSystemConfigParsed = JSON.parse(userSystemConfig)
        } catch (e) {
            throw new KnownError(
                `System configuration file is not a valid JSON!\n\nFile location: ${systemConfigPath}`
            )
        }

        if (validate) {
            try {
                await systemConfigurationSchema.validateAsync(
                    userSystemConfigParsed
                )
            } catch (e) {
                if (e instanceof Error) {
                    throw new KnownError(
                        `Configuration file validation error!\n\n${e.message}`
                    )
                }

                throw e
            }
        }

        return deepmerge(defaultSystemConfig, userSystemConfigParsed)
    }

    return defaultSystemConfig
}

const getSystemConfigSync = ({ validate = true } = {}) => {
    if (pathExistsSync(systemConfigPath)) {
        const userSystemConfig = fs.readFileSync(systemConfigPath, {
            encoding: 'utf-8'
        })
        let userSystemConfigParsed
        try {
            userSystemConfigParsed = JSON.parse(userSystemConfig)
        } catch (e) {
            throw new KnownError(
                `System configuration file is not a valid JSON!\n\nFile location: ${systemConfigPath}`
            )
        }
        if (validate) {
            try {
                systemConfigurationSchema.validate(userSystemConfigParsed)
            } catch (e) {
                if (e instanceof Error) {
                    throw new KnownError(
                        `Configuration file validation error!\n\n${e.message}`
                    )
                }

                throw e
            }
        }

        return deepmerge(defaultSystemConfig, userSystemConfigParsed)
    }

    return defaultSystemConfig
}

/**
 * Get system configuration from configuration file located in user root directory.
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getSystemConfigTask = () => ({
    task: async (ctx) => {
        ctx.systemConfiguration = await getSystemConfig()
    }
})

module.exports = {
    defaultSystemConfig,
    getSystemConfigTask,
    getSystemConfig,
    getSystemConfigSync
}
