FROM ghcr.io/scandipwa/create-magento-app:php-8.4

LABEL org.opencontainers.image.description="Create Magento App PHP 8.4 container image with XDebug extension"

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && apk add --no-cache linux-headers \
    && pecl install xdebug-3.4.0 \
    && docker-php-ext-enable xdebug \
    && apk del -f .build-deps
