const { setPrefix: setPrefixUtil } = require('../../util/prefix');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const setPrefix = {
    // if project is missing prefix, set one
    title: 'Settings project prefix',
    task: (ctx) => {
        const { config: { overridenConfiguration } } = ctx;
        setPrefixUtil(overridenConfiguration.prefix);
    }
};

module.exports = {
    setPrefix
};
