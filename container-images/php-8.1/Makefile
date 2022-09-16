build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-8.1 .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-8.1 .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-8.1 --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-8.1
buildandrun:
	build --no-cache && run
