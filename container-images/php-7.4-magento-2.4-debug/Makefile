build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-7.4-magento-2.4-debug .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.4-magento-2.4-debug .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.4-magento-2.4-debug --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-7.4-magento-2.4-debug
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:php-7.4-magento-2.4-debug
