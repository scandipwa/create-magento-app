build:
	docker build --tag ghcr.io/scandipwa/create-magento-app:opensearch-2.12.0-analysis-phonetic .
buildx:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:opensearch-2.12.0-analysis-phonetic .
buildxpush:
	docker buildx build --platform linux/arm64,linux/amd64 --tag ghcr.io/scandipwa/create-magento-app:opensearch-2.12.0-analysis-phonetic --push .
run:
	docker run -it ghcr.io/scandipwa/create-magento-app:opensearch-2.12.0-analysis-phonetic
buildandrun:
	build --no-cache && run
pull:
	docker pull ghcr.io/scandipwa/create-magento-app:opensearch-2.12.0-analysis-phonetic
