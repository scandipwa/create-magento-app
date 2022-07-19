/* eslint-disable max-len */
/**
 * @type {import('../../../../typings/index').PHPExtensionInstallationInstruction}
 */
module.exports = {
    name: 'apcu',
    // eslint-disable-next-line quotes
    command: `apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \
&& pecl install apcu \
&& docker-php-ext-enable apcu \
&& apk del -f .build-deps`
};
