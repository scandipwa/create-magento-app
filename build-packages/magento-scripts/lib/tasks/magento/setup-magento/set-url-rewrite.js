// const runMagentoCommand = require('../../../util/run-magento');

const { updateTableValues } = require('../../../util/database');

const setUrlRewrite = {
    title: 'Setting up url-rewrites',
    task: async ({ mysqlConnection }, task) => {
        await updateTableValues('core_config_data', [
            {
                path: 'web/seo/use_rewrites',
                value: '1'
            }
        ], { mysqlConnection, task });
    }
};

module.exports = setUrlRewrite;
