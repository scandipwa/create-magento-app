build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-8.3-debug .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-8.3-debug .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-8.3-debug --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-8.3-debug
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:php-8.3-debug
