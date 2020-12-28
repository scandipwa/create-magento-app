const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Setting baseurl and secure baseurl',
    task: async ({ ports, magentoVersion }, task) => {
        const location = `localhost${ ports.app !== 80 ? `:${ports.app}` : '' }/`;
        const httpUrl = `http://${location}`;
        const httpsUrl = `https://${location}`;

        const [
            { result: webUnsecureBaseUrl },
            { result: webSecureBaseUrl },
            { result: webSecureUseInFrontend },
            { result: webSecureUseInAdminhtml }
        ] = await Promise.all([
            runMagentoCommand('config:show web/unsecure/base_url', {
                throwNonZeroCode: false,
                magentoVersion
            }),
            runMagentoCommand('config:show web/secure/base_url', {
                throwNonZeroCode: false,
                magentoVersion
            }),
            runMagentoCommand('config:show web/secure/use_in_frontend', {
                throwNonZeroCode: false,
                magentoVersion
            }),
            runMagentoCommand('config:show web/secure/use_in_adminhtml', {
                throwNonZeroCode: false,
                magentoVersion
            })
        ]);

        let skipped = 0;

        if (webUnsecureBaseUrl !== httpUrl) {
            await runMagentoCommand(`config:set web/unsecure/base_url ${httpUrl}`, { magentoVersion });
        } else {
            skipped++;
        }

        if (webSecureBaseUrl !== httpsUrl) {
            await runMagentoCommand(`config:set web/secure/base_url ${httpsUrl}`, { magentoVersion });
        } else {
            skipped++;
        }

        if (webSecureUseInFrontend !== '0') {
            await runMagentoCommand('config:set web/secure/use_in_frontend 0', { magentoVersion });
        } else {
            skipped++;
        }

        if (webSecureUseInAdminhtml !== '0') {
            await runMagentoCommand('config:set web/secure/use_in_adminhtml 0', { magentoVersion });
        } else {
            skipped++;
        }

        if (skipped === 4) {
            task.skip();
        }
    }
};
