/* eslint-disable max-len */
/**
 * @type {import('../../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'xdebug',
    command: ({
        version = ''
    }) => `apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \
&& apk add --no-cache linux-headers \
&& pecl install xdebug${version ? `-${version}` : ''} \
&& docker-php-ext-enable xdebug \
&& apk del -f .build-deps`,
    version: '3.1.6'
}
