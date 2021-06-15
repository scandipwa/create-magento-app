/* eslint-disable no-param-reassign */
const path = require('path');
const envPhpToJson = require('../../util/env-php-json');
const getJsonfileData = require('../../util/get-jsonfile-data');
const runMagentoCommand = require('../../util/run-magento');

/**
 * TODO move this block inside theme folder as post installation command
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const persistedQuerySetup = {
    title: 'Setting up redis configuration for persisted queries',
    task: async ({ ports, magentoVersion }, task) => {
        const composerLockData = await getJsonfileData(path.join(process.cwd(), 'composer.lock'));

        if (!composerLockData.packages.some(({ name }) => name === 'scandipwa/persisted-query')) {
            /**
             * No persisted query package available, skipping its setup
             */
            task.skip();
            return;
        }

        const envPhp = await envPhpToJson(process.cwd(), { magentoVersion });

        const persistedQueryConfig = envPhp.cache && envPhp.cache['persisted-query'];

        if (
            persistedQueryConfig
            && persistedQueryConfig.redis
            && persistedQueryConfig.redis.port === ports.redis
            && persistedQueryConfig.redis.localhost === 'localhost'
        ) {
            task.skip();
            return;
        }

        try {
            await runMagentoCommand(`setup:config:set \
        --pq-host=localhost \
        --pq-port=${ports.redis} \
        --pq-database=5 \
        --pq-scheme=tcp \
        -n`, {
                callback: (t) => {
                    task.output = t;
                },
                magentoVersion
            });
        } catch (e) {
            throw new Error(
                `Unexpected error while setting redis for pq!.
                See ERROR log below.\n\n${e}`
            );
        }
    }
};

module.exports = persistedQuerySetup;
