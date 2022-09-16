build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:php-7.4 .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.4 .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:php-7.4 --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:php-7.4
buildandrun:
	build --no-cache && run
