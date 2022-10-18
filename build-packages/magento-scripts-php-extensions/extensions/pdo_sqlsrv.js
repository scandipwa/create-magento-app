module.exports = {
    // eslint-disable-next-line quotes
    command: `apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \
    && pecl install pdo_sqlsrv \
    && docker-php-ext-enable pdo_sqlsrv \
    && apk del -f .build-deps`,
    dependencies: ['unixodbc-dev']
}
