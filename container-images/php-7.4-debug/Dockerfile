FROM ghcr.io/scandipwa/create-magento-app:php-7.4

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install xdebug-3.1.6 \
    && docker-php-ext-enable xdebug \
    && apk del -f .build-deps
