build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:elasticsearch-7.17.9-analysis-phonetic .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:elasticsearch-7.17.9-analysis-phonetic .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:elasticsearch-7.17.9-analysis-phonetic --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:elasticsearch-7.17.9-analysis-phonetic
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:elasticsearch-7.17.9-analysis-phonetic
