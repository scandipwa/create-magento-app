const { request } = require('smol-request');
const KnownError = require('../../../errors/known-error');
const sleep = require('../../../util/sleep');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const waitingForVarnish = () => ({
    title: 'Waiting for Varnish to return code 200',
    skip: (ctx) => !ctx.config.overridenConfiguration.configuration.varnish.enabled,
    task: async (ctx) => {
        let tries = 0;
        while (tries < 10) {
            try {
                const response = await request(`http://localhost:${ctx.ports.sslTerminator}/`, {
                    responseType: 'headers'
                });

                if (response.status !== 200) {
                    tries++;
                    await sleep(2000);
                } else {
                    break;
                }
            } catch (e) {
                tries++;
                await sleep(200);
            }
        }

        if (tries === 10) {
            throw new KnownError(`After 20 seconds website is still responding with non-200 code, which might indicate issue with setup.
Or Varnish is still loading...

Please check the logs!`);
        }
    },
    exitOnError: false
});

module.exports = waitingForVarnish;
