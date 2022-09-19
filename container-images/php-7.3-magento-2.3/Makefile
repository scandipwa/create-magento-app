build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-7.3-magento-2.3 .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.3-magento-2.3 .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.3-magento-2.3 --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-7.3-magento-2.3
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:php-7.3-magento-2.3
