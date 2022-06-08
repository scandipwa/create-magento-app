const fs = require('fs');
const path = require('path');
const semver = require('semver');
const UnknownError = require('../../../errors/unknown-error');
const runMagentoCommand = require('../../../util/run-magento');
const envPhpToJson = require('../../../util/env-php-json');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');

/**
 * @param {Object} [param0]
 * @param {Boolean} param0.isDbEmpty
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installMagento = ({ isDbEmpty = false } = {}) => ({
    title: 'Installing magento',
    task: async (ctx, task) => {
        if (isDbEmpty) {
            task.output = 'No Magento is installed in DB!\nInstalling...';
        }
        const {
            magentoVersion,
            config: {
                docker,
                magentoConfiguration
            },
            ports
        } = ctx;
        const { mysql: { env } } = docker.getContainers(ports);
        const envPhpData = await envPhpToJson(process.cwd(), {
            magentoVersion: ctx.magentoVersion
        });

        const envPhpHaveEncryptionKey = envPhpData && envPhpData.crypt && envPhpData.crypt.key && envPhpData.crypt.key;

        let encryptionKeyOption = null;

        if (ctx.encryptionKey) {
            encryptionKeyOption = `--key='${ctx.encryptionKey}'`;
        }

        if (envPhpHaveEncryptionKey && !encryptionKeyOption) {
            encryptionKeyOption = `--key='${envPhpData.crypt.key}'`;
        }

        let installed = false;

        const pureMagentoVersion = magentoVersion.match(/^([0-9]+\.[0-9]+\.[0-9]+)/)[1];

        const isMagento23 = semver.satisfies(pureMagentoVersion, '<2.4');

        const elasticsearchConfiguration = ` \
--search-engine='elasticsearch7' \
--elasticsearch-host='127.0.0.1' \
--elasticsearch-port='${ ports.elasticsearch }'`;

        /**
         * @type {Array<Error>}
         */
        const errors = [];

        for (let tries = 0; tries < 2; tries++) {
            try {
                const command = `setup:install \
                --admin-firstname='${ magentoConfiguration.first_name }' \
                --admin-lastname='${ magentoConfiguration.last_name }' \
                --admin-email='${ magentoConfiguration.email }' \
                --admin-user='${ magentoConfiguration.user }' \
                --admin-password='${ magentoConfiguration.password }' \
                ${ !isMagento23 ? elasticsearchConfiguration : '' } \
                ${encryptionKeyOption || ''} \
                --session-save=redis \
                --session-save-redis-host='127.0.0.1' \
                --session-save-redis-port='${ ports.redis }' \
                --session-save-redis-log-level='3' \
                --session-save-redis-max-concurrency='30' \
                --session-save-redis-db='1' \
                --session-save-redis-disable-locking='1' \
                --cache-backend='redis' \
                --cache-backend-redis-server='127.0.0.1' \
                --cache-backend-redis-port='${ ports.redis }' \
                --cache-backend-redis-db='0't \
                --db-host='127.0.0.1:${ ports.mysql }' \
                --db-name='${ env.MYSQL_DATABASE }' \
                --db-user='${ env.MYSQL_USER }' \
                --db-password='${ env.MYSQL_PASSWORD }' \
                --backend-frontname='${ magentoConfiguration.adminuri }' \
                --no-interaction ${ tries > 0 ? '--cleanup-database' : '' }`;

                await runMagentoCommand(command, {
                    magentoVersion,
                    throwNonZeroCode: true,
                    callback: !ctx.verbose ? undefined : (t) => {
                        task.output = t;
                    }
                });

                installed = true;
            } catch (e) {
                errors.push(e);
                if (tries === 2) {
                    throw e;
                }
            }

            if (installed) {
                break;
            }
        }

        if (errors.length > 0) {
            if (envPhpHaveEncryptionKey && errors.some(
                (e) => e.message.includes('The default website isn\'t defined. Set the website and try again.')
            )
            ) {
                const confirmToWipeEnvPhp = await task.prompt({
                    type: 'Confirm',
                    message: `We detected that your encryption key in ${logger.style.file('app/etc/env.php')} file is not accepted by Magento installer.
To fix this issue we will need to ${logger.style.misc('DELETE')} ${logger.style.file('app/etc/env.php')} file. It will be recreated but existing encryption key but if you any custom configuration in it will be lost.

Without this you will not be able to install Magento at this moment.

Do you want to continue?`
                });

                if (confirmToWipeEnvPhp) {
                    try {
                        await fs.promises.unlink(path.join(process.cwd(), 'app', 'etc', 'env.php'));
                    } catch (e) {
                        throw new UnknownError(`Unexpected error occurred during deleting of app/etc/env.php file!\n\n${e}`);
                    }
                    ctx.encryptionKey = envPhpData.crypt.key;

                    return task.run(ctx);
                }
            }
        }

        if (!installed) {
            const errorMessages = errors.map((e) => e.message).join('\n\n');
            throw new UnknownError(`Unable to install Magento!\n${errorMessages}`);
        }
    },
    options: {
        bottomBar: 15
    }
});

module.exports = installMagento;
