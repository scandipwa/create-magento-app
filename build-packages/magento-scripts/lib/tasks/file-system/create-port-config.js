const { savePortsConfig } = require('../../util/ports');

const createPortConfig = {
    title: 'Setting port config',
    task: async ({ ports }) => {
        try {
            await savePortsConfig(ports);
        } catch (e) {
            throw new Error(`Unexpected error accrued during port config creation\n\n${e}`);
        }
    }
};

module.exports = createPortConfig;
