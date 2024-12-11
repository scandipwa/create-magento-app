FROM php:8.3-fpm-alpine3.20

LABEL org.opencontainers.image.source=https://github.com/scandipwa/create-magento-app
LABEL org.opencontainers.image.description="Create Magento App PHP 8.3 container image"
LABEL org.opencontainers.image.licenses=OSL-3.0

# persistent / runtime deps
RUN apk add --no-cache \
		linux-headers \
		patch
