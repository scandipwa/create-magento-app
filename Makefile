ubuntu:
	docker build -t cma/ubuntu:1 --build-arg COMPOSER_AUTH=$COMPOSER_AUTH -f ./docker-actions/ubuntu/Dockerfile .

run-ubuntu:
	docker run -e COMPOSER_AUTH -v /var/run/docker.sock:/var/run/docker.sock -v /home/ejnshtein/.cache/composer:/root/.cache/composer/  cma/ubuntu:1

arch:
	docker build -t cma/arch:1 --build-arg COMPOSER_AUTH=$COMPOSER_AUTH -f ./docker-actions/arch/Dockerfile .

run-arch:
	docker run -e COMPOSER_AUTH -v /var/run/docker.sock:/var/run/docker.sock -v /home/ejnshtein/.cache/composer:/root/.cache/composer/ cma/arch:1

mint:
	docker build -t cma/mint:1 --build-arg COMPOSER_AUTH=$COMPOSER_AUTH -f ./docker-actions/mint/Dockerfile .

run-mint:
	docker run -e COMPOSER_AUTH -v /var/run/docker.sock:/var/run/docker.sock  -v /home/ejnshtein/.cache/composer:/root/.cache/composer/ cma/mint:1