FROM ghcr.io/scandipwa/create-magento-app:php-8.3

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && apk add --no-cache linux-headers \
    && pecl install xdebug-3.3.0alpha3 \
    && docker-php-ext-enable xdebug \
    && apk del -f .build-deps
