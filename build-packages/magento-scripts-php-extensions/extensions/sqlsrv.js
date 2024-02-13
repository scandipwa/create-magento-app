const semver = require('semver')

/** @type {import('@scandipwa/magento-scripts').PHPExtensionInstallationInstruction['command']} */
const installCommand = ({ ctx, version }) => {
    let sqlsrvVersion = version
    if (!sqlsrvVersion) {
        if (semver.gte(ctx.phpVersion, '7.3.0')) {
            sqlsrvVersion = '5.9.0'
        }
        if (semver.gte(ctx.phpVersion, '7.4.0')) {
            sqlsrvVersion = '5.10.1'
        }
        if (semver.gte(ctx.phpVersion, '8.1.0')) {
            sqlsrvVersion = '5.11.0'
        }
        if (semver.gte(ctx.phpVersion, '8.3.0')) {
            sqlsrvVersion = '5.12.0'
        }
    }

    return `apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \
    && pecl install sqlsrv${sqlsrvVersion ? `-${sqlsrvVersion}` : ''} \
    && docker-php-ext-enable sqlsrv \
    && apk del -f .build-deps`
}
module.exports = {
    command: installCommand,
    dependencies: ['unixodbc-dev']
}
