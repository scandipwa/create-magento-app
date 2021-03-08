// const runMagentoCommand = require('../../../util/run-magento');

const setUrlRewrite = {
    title: 'Setting up url-rewrites',
    task: async ({ mysqlConnection }, task) => {
        // const { result } = await runMagentoCommand('config:show web/seo/use_rewrites', {
        //     throwNonZeroCode: false,
        //     magentoVersion
        // });

        const [rows] = await mysqlConnection.query(`
            SELECT * FROM core_config_data
            WHERE path = 'web/seo/use_rewrites';
        `);

        const [useRewrites] = rows;

        if (useRewrites.value === '1') {
            task.skip();
            return;
        }

        await mysqlConnection.query(`
            UPDATE core_config_data
            SET value = '1'
            WHERE path = 'web/seo/use_rewrites';
        `);

        // await runMagentoCommand('config:set web/seo/use_rewrites 1', { magentoVersion });
    }
};

module.exports = setUrlRewrite;
