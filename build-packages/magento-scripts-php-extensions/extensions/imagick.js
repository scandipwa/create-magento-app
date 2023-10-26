// imagick 3.7.0 is latest release of imagick on peck and supports PHP 5.4.0 and newer
// requires ImageMagick version 6.5.3-10+
module.exports = {
    command: `apk add --no-cache --virtual .build-deps \\$PHPIZE_DEPS \
    && pecl install imagick 3.7.0 \
    && docker-php-ext-enable imagick \
    && apk del -f .build-deps`,
    dependencies: ['imagemagick-dev', 'libgomp']
}
