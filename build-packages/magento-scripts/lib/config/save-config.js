/* eslint-disable no-param-reassign */
const { savePortsConfig } = require('./port-config');

const saveConfiguration = {
    title: 'Saving configuration',
    task: async (ctx) => {
        const { ports } = ctx;

        await savePortsConfig(ports);
    }
};

module.exports = {
    saveConfiguration
};
