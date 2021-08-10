const os = require('os');
const path = require('path');
const fs = require('fs');
const pathExists = require('../util/path-exists');
const { systemConfigurationSchema } = require('../util/config-file-validator');
const { deepmerge } = require('../util/deepmerge');

const defaultSystemConfig = {
    analytics: true,
    useNonOverlappingPorts: false
};
const systemConfigPath = path.join(os.homedir(), '.cmarc');

/**
 * @returns {Promise<typeof defaultSystemConfig>}
 */
const getSystemConfig = async () => {
    if (await pathExists(systemConfigPath)) {
        const userSystemConfig = await fs.promises.readFile(systemConfigPath, 'utf-8');
        let userSystemConfigParsed;
        try {
            userSystemConfigParsed = JSON.parse(userSystemConfig);
        } catch (e) {
            throw new Error(`System configuration file is not a valid JSON!\n\nFile location: ${systemConfigPath}`);
        }
        try {
            await systemConfigurationSchema.validateAsync(userSystemConfigParsed);
        } catch (e) {
            throw new Error(`Configuration file validation error!\n\n${e.message}`);
        }

        return deepmerge(defaultSystemConfig, userSystemConfigParsed);
    }

    return defaultSystemConfig;
};

/**
 * Get system configuration from configuration file located in user root directory.
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getSystemConfigTask = () => ({
    task: async (ctx) => {
        ctx.systemConfiguration = await getSystemConfig();
    }
});

module.exports = {
    defaultSystemConfig,
    getSystemConfigTask,
    getSystemConfig
};
