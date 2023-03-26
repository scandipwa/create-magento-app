build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-8.2 .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-8.2 .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-8.2 --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-8.2
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:php-8.2
