// const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Setting baseurl and secure baseurl',
    task: async (ctx, task) => {
        const {
            ports,
            // magentoVersion,
            config: { overridenConfiguration: { host, ssl } },
            mysqlConnection
        } = ctx;
        const location = `${host}${ ports.app !== 80 ? `:${ports.app}` : '' }/`;
        const httpUrl = `http://${location}`;
        const httpsUrl = `https://${location}`;

        // const [
        //     { result: webUnsecureBaseUrl },
        //     { result: webSecureBaseUrl },
        //     { result: webSecureUseInFrontend },
        //     { result: webSecureUseInAdminhtml }
        // ] = await Promise.all([
        //     runMagentoCommand('config:show web/unsecure/base_url', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     }),
        //     runMagentoCommand('config:show web/secure/base_url', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     }),
        //     runMagentoCommand('config:show web/secure/use_in_frontend', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     }),
        //     runMagentoCommand('config:show web/secure/use_in_adminhtml', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     })
        // ]);

        const [rows] = await mysqlConnection.query(`
            SELECT * FROM core_config_data
            WHERE path = 'web/unsecure/base_url'
            OR path = 'web/secure/base_url'
            OR path = 'web/secure/use_in_frontend'
            OR path = 'web/secure/use_in_adminhtml';
        `);

        const [
            webUnsecureBaseUrl,
            webSecureBaseUrl,
            webSecureUseInFrontend,
            webSecureUseInAdminhtml
        ] = rows;

        let skipped = 0;

        if (webUnsecureBaseUrl.value !== httpUrl) {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = ?
                WHERE path = 'web/unsecure/base_url';
            `, [httpUrl]);
            // await runMagentoCommand(`config:set web/unsecure/base_url ${httpUrl}`, { magentoVersion });
        } else {
            skipped++;
        }

        if (webSecureBaseUrl.value !== httpsUrl) {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = ?
                WHERE path = 'web/secure/base_url';
            `, [httpsUrl]);
            // await runMagentoCommand(`config:set web/secure/base_url ${httpsUrl}`, { magentoVersion });
        } else {
            skipped++;
        }

        const enableSecureFrontend = ssl.enabled ? '1' : '0';

        if (webSecureUseInFrontend.value !== enableSecureFrontend) {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = ?
                WHERE path = 'web/secure/use_in_frontend';
            `, [enableSecureFrontend]);
            // await runMagentoCommand(`config:set web/secure/use_in_frontend ${enableSecureFrontend}`, {
            //     magentoVersion
            // });
        } else {
            skipped++;
        }

        if (webSecureUseInAdminhtml.value !== enableSecureFrontend) {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = ?
                WHERE path = 'web/secure/use_in_adminhtml';
            `, [enableSecureFrontend]);
            // await runMagentoCommand(`config:set web/secure/use_in_adminhtml ${enableSecureFrontend}`, {
            //     magentoVersion
            // });
        } else {
            skipped++;
        }

        if (skipped === 4) {
            task.skip();
        }
    }
};
