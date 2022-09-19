build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:elasticsearch-6.8 .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:elasticsearch-6.8 .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:elasticsearch-6.8 --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:elasticsearch-6.8
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:elasticsearch-6.8
