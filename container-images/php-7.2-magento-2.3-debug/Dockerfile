FROM ghcr.io/scandipwa/create-magento-app:php-7.2-debug

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && apk del -f .build-deps

RUN apk add --no-cache libxml2-dev libzip-dev libxslt-dev icu-dev icu-data-full freetype-dev libjpeg-turbo-dev libpng-dev zlib-dev libwebp-dev

RUN docker-php-ext-install soap zip xsl pdo_mysql bcmath opcache

RUN docker-php-ext-configure gd --with-freetype-dir=/usr --with-jpeg-dir=/usr --with-png-dir=/usr --with-zlib-dir=/usr --with-webp-dir=/usr && docker-php-ext-install gd

RUN apk add --no-cache patch bash git
