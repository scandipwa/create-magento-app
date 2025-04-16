FROM php:8.4-fpm-alpine3.21

RUN apk add --no-cache \
		linux-headers \
		openssh \
		patch \
        bash \
        git

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && apk del -f .build-deps

RUN apk add --no-cache libxml2-dev libzip-dev libxslt-dev icu-dev icu-data-full freetype-dev libjpeg-turbo-dev libpng-dev zlib-dev libwebp-dev

RUN docker-php-ext-install soap zip xsl pdo_mysql intl bcmath opcache sockets ftp

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && docker-php-ext-install gd
