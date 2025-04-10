build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:file-sync .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:file-sync .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:file-sync --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:file-sync
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:file-sync
