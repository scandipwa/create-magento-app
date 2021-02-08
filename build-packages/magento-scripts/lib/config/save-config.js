/* eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const pathExists = require('../util/path-exists');
const cleanObject = require('../util/clean-object');

const saveConfig = async (config) => {
    await fs.promises.writeFile(
        path.join(process.cwd(), 'cma.json'),
        JSON.stringify(config, null, 2),
        { encoding: 'utf8' }
    );
};

const configFileKeys = ['magento', 'ports', 'configuration'];

const saveConfiguration = {
    title: 'Saving configuration',
    task: async (ctx, task) => {
        const { config, ports } = ctx;
        if (JSON.stringify(ports) !== JSON.stringify(config.ports)) {
            await saveConfig(
                cleanObject(
                    {
                        ...config.userConfiguration,
                        ports
                    },
                    configFileKeys
                )
            );
            task.title = 'Configuration updated!';
        } else if (!await pathExists(path.join(process.cwd(), 'cma.json'))) {
            await saveConfig({
                magento: config.magentoConfiguration,
                ports: config.ports,
                configuration: {}
            });
        }

        task.skip();
    }
};

module.exports = {
    saveConfiguration
};
