FROM php:8.1-fpm-alpine3.20

LABEL org.opencontainers.image.source=https://github.com/scandipwa/create-magento-app
LABEL org.opencontainers.image.description="Create Magento App PHP 8.1 container image"
LABEL org.opencontainers.image.licenses=OSL-3.0

# persistent / runtime deps
RUN apk add --no-cache \
		linux-headers \
		patch

# Override stop signal to stop process gracefully
# https://github.com/php/php-src/blob/17baa87faddc2550def3ae7314236826bc1b1398/sapi/fpm/php-fpm.8.in#L163
STOPSIGNAL SIGQUIT
