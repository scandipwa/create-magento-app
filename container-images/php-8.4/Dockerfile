FROM php:8.4-fpm-alpine

LABEL org.opencontainers.image.source=https://github.com/scandipwa/create-magento-app
LABEL org.opencontainers.image.description="Create Magento App PHP 8.4 container image"
LABEL org.opencontainers.image.licenses=OSL-3.0

# persistent / runtime deps
RUN apk add --no-cache \
		linux-headers \
		patch