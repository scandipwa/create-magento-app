FROM ghcr.io/scandipwa/create-magento-app:php-8.4-magento-2.4

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install xdebug-3.4.0 \
    && docker-php-ext-enable xdebug \
    && apk del -f .build-deps
