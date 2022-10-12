module.exports = {
    // eslint-disable-next-line quotes
    command: `apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \
    && pecl install memcached \
    && docker-php-ext-enable memcached \
    && apk del -f .build-deps`,
    dependencies: [
        'libevent-dev',
        'libmemcached-dev',
        'zlib-dev'
    ]
};
