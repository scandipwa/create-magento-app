build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-7.2-magento-2.3-debug .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.2-magento-2.3-debug .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.2-magento-2.3-debug --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-7.2-magento-2.3-debug
buildandrun:
	build --no-cache && run
