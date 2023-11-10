## Container images for CMA

This folder contains images used for `magento-scripts` V2 projects.

### Requirements
[Docker Desktop](https://docs.docker.com/desktop/) is installed and running. On Linux set the docker context to use Docker Desktop (`docker context use desktop-linux`).

For MacOS: Run command to create a builder for docker: `docker buildx create --platform linux/arm64,linux/arm/v8 --use`

### Pulling Images

#### All Images

To pull all images (ElasticSearch + PHP images without XDebug + PHP images with XDebug) run the following command:
```bash
make pull-all
```

#### PHP Images

##### All versions

To pull PHP images with and without XDebug run the following command:
```bash
make pull-all-php && make pull-all-php-debug
```

To pull PHP images without XDebug run the following command:
```bash
make pull-all-php
```

To also pull PHP images with XDebug run the following command:
```bash
make pull-all-php-debug
```

##### 8.2 version

To pull PHP 8.2 images with and without XDebug run the following command:
```bash
make pull-php-82-all
```

To pull PHP 8.2 image without XDebug run the following command:
```bash
make pull-php-82 && make pull-php-82-magento-24
```

To also pull PHP 8.2 image with XDebug run the following command:
```bash
make pull-php-82-debug && make pull-php-82-magento-24-debug
```

##### 8.2 version with extensions for Magento 2.4

To pull PHP 8.2 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make pull-php-82-magento-24 && make pull-php-82-magento-24-debug
```

To pull PHP 8.2 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make pull-php-82-magento-24
```

To also pull PHP 8.2 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make pull-php-82-magento-24-debug
```

##### 8.1 version

To pull PHP 8.1 images with and without XDebug run the following command:
```bash
make pull-php-81-all
```

To pull PHP 8.1 image without XDebug run the following command:
```bash
make pull-php-81 && make pull-php-81-magento-24
```

To also pull PHP 8.1 image with XDebug run the following command:
```bash
make pull-php-81-debug && make pull-php-81-magento-24-debug
```

##### 8.1 version with extensions for Magento 2.4

To pull PHP 8.1 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make pull-php-81-magento-24 && make pull-php-81-magento-24-debug
```

To pull PHP 8.1 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make pull-php-81-magento-24
```

To also pull PHP 8.1 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make pull-php-81-magento-24-debug
```

##### 7.4 version

To pull PHP 7.4 images with and without XDebug run the following command:
```bash
make pull-php-74-all
```

To pull PHP 7.4 image without XDebug run the following command:
```bash
make pull-php-74 && make pull-php-74-magento-24 && make pull-php-74-magento-23
```

To also pull PHP 7.4 image with XDebug run the following command:
```bash
make pull-php-74-debug && make pull-php-74-magento-24-debug && make pull-php-74-magento-23-debug
```

##### 7.4 version with extensions for Magento 2.4

To pull PHP 7.4 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make pull-php-74-magento-24 && make pull-php-74-magento-24-debug
```

To pull PHP 7.4 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make pull-php-74-magento-24
```

To also pull PHP 7.4 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make pull-php-74-magento-24-debug
```

##### 7.4 version with extensions for Magento 2.3

To pull PHP 7.4 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make pull-php-74-magento-23 && make pull-php-74-magento-23-debug
```

To pull PHP 7.4 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make pull-php-74-magento-23
```

To also pull PHP 7.4 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make pull-php-74-magento-23-debug
```

##### 7.3 version

To pull PHP 7.3 images with and without XDebug run the following command:
```bash
make pull-php-73-all
```

To pull PHP 7.3 image without XDebug run the following command:
```bash
make pull-php-73 && make pull-php-73-magento-23
```

To also pull PHP 7.3 image with XDebug run the following command:
```bash
make pull-php-73-debug && make pull-php-73-magento-23-debug
```

##### 7.3 version with extensions for Magento 2.3

To pull PHP 7.3 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make pull-php-73-magento-23 && make pull-php-73-magento-23-debug
```

To pull PHP 7.3 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make pull-php-73-magento-23
```

To also pull PHP 7.3 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make pull-php-73-magento-23-debug
```

##### 7.2 version

To pull PHP 7.2 images with and without XDebug run the following command:
```bash
make pull-php-72-all
```

To pull PHP 7.2 image without XDebug run the following command:
```bash
make pull-php-72 && make pull-php-72-magento-23
```

To also pull PHP 7.2 image with XDebug run the following command:
```bash
make pull-php-72-debug && make pull-php-72-magento-23-debug
```

##### 7.2 version with extensions for Magento 2.3

To pull PHP 7.2 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make pull-php-72-magento-23 && make pull-php-72-magento-23-debug
```

To pull PHP 7.2 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make pull-php-72-magento-23
```

To also pull PHP 7.2 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make pull-php-72-magento-23-debug
```

#### ElasticSearch Images

To pull all ElasticSearch images run the following command:
```bash
make pull-elasticsearch
```

### Build images for your CPU architecture

#### All Images

To build all images (ElasticSearch, PHP, PHP with XDebug, PHP with Magento extensions) run the following command:
```bash
make build-all
```

#### PHP Images

##### All versions

To build PHP images with and without XDebug run the following command:
```bash
make build-all-php && make build-all-php-debug
```

To build PHP images without XDebug run the following command:
```bash
make build-all-php
```

To also build PHP images with XDebug run the following command:
```bash
make build-all-php-debug
```

##### 8.2 version

To build PHP 8.2 image with and without XDebug run the following command:
```bash
make build-php-82-all
```

To build PHP 8.2 image without XDebug run the following command:
```bash
make build-php-82 && make build-php-82-magento-24
```

To also build PHP 8.2 image with XDebug run the following command:
```bash
make build-php-82-debug && make build-php-82-magento-24-debug
```

##### 8.2 version with extensions for Magento 2.4

To build PHP 8.2 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make build-php-82-magento-24 && make build-php-82-magento-24-debug
```

To build PHP 8.2 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make build-php-82-magento-24
```

To also build PHP 8.2 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make build-php-82-magento-24-debug
```

##### 8.1 version

To build PHP 8.1 image with and without XDebug run the following command:
```bash
make build-php-81-all
```

To build PHP 8.1 image without XDebug run the following command:
```bash
make build-php-81 && make build-php-81-magento-24
```

To also build PHP 8.1 image with XDebug run the following command:
```bash
make build-php-81-debug && make build-php-81-magento-24-debug
```

##### 8.1 version with extensions for Magento 2.4

To build PHP 8.1 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make build-php-81-magento-24 && make build-php-81-magento-24-debug
```

To build PHP 8.1 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make build-php-81-magento-24
```

To also build PHP 8.1 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make build-php-81-magento-24-debug
```

##### 7.4 version

To build PHP 7.4 image with and without XDebug run the following command:
```bash
make build-php-74-all
```

To build PHP 7.4 image without XDebug run the following command:
```bash
make build-php-74 && make build-php-74-magento-24
```

To also build PHP 7.4 image with XDebug run the following command:
```bash
make build-php-74-debug && build-php-74-magento-24-debug
```

##### 7.4 version with extensions for Magento 2.4

To build PHP 7.4 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make build-php-74-magento-24 && make build-php-74-magento-24-debug
```

To build PHP 7.4 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make build-php-74-magento-24
```

To also build PHP 7.4 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make build-php-74-magento-24-debug
```

##### 7.4 version with extensions for Magento 2.3

To build PHP 7.4 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make build-php-74-magento-23 && make build-php-74-magento-23-debug
```

To build PHP 7.4 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make build-php-74-magento-23
```

To also build PHP 7.4 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make build-php-74-magento-23-debug
```

##### 7.3 version

To build PHP 7.3 image with and without XDebug run the following command:
```bash
make build-php-73-all
```

To build PHP 7.3 image without XDebug run the following command:
```bash
make build-php-73 && make build-php-73-magento-23
```

To also build PHP 7.3 image with XDebug run the following command:
```bash
make build-php-73-debug && make build-php-73-magento-23-debug
```

##### 7.3 version with extensions for Magento 2.3

To build PHP 7.3 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make build-php-73-magento-23 && make build-php-73-magento-23-debug
```

To build PHP 7.3 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make build-php-73-magento-23
```

To also build PHP 7.3 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make build-php-73-magento-23-debug
```

##### 7.2 version

To build PHP 7.2 image with and without XDebug run the following command:
```bash
make build-php-72-all
```

To build PHP 7.2 image without XDebug run the following command:
```bash
make build-php-72 && make build-php-72-magento-23
```

To also build PHP 7.2 image with XDebug run the following command:
```bash
make build-php-72-debug && make build-php-72-magento-23-debug
```

##### 7.2 version with extensions for Magento 2.3

To build PHP 7.2 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make build-php-72-magento-23 && make build-php-72-magento-23-debug
```

To build PHP 7.2 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make build-php-72-magento-23
```

To also build PHP 7.2 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make build-php-72-magento-23-debug
```

### Build images for multiple CPU architectures (amd64, arm64)

#### All Images

To build all images using [buildx](https://github.com/docker/buildx) for  multi-arch support (amd64, arm64), run the following command:
```bash
make buildx-all
```

#### PHP Images

##### All versions

To build PHP images with and without XDebug run the following command:
```bash
make buildx-all-php && make buildx-all-php-debug
```

To build PHP images without XDebug run the following command:
```bash
make buildx-all-php
```

To also build PHP images with XDebug run the following command:
```bash
make buildx-all-php-debug
```

##### 8.2 version

To build PHP 8.2 image with and without XDebug run the following command:
```bash
make buildx-php-82-all
```

To build PHP 8.2 image without XDebug run the following command:
```bash
make buildx-php-82 && make buildx-php-82-magento-24
```

To also build PHP 8.2 image with XDebug run the following command:
```bash
make buildx-php-82-debug && make buildx-php-82-magento-24-debug
```

##### 8.2 version with extensions for Magento 2.4

To build PHP 8.2 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make buildx-php-82-magento-24 && make buildx-php-82-magento-24-debug
```

To build PHP 8.2 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make buildx-php-82-magento-24
```

To also build PHP 8.2 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make buildx-php-82-magento-24-debug
```

##### 8.1 version

To build PHP 8.1 image with and without XDebug run the following command:
```bash
make buildx-php-81-all
```

To build PHP 8.1 image without XDebug run the following command:
```bash
make buildx-php-81 && make buildx-php-81-magento-24
```

To also build PHP 8.1 image with XDebug run the following command:
```bash
make buildx-php-81-debug && make buildx-php-81-magento-24-debug
```

##### 8.1 version with extensions for Magento 2.4

To build PHP 8.1 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make buildx-php-81-magento-24 && make buildx-php-81-magento-24-debug
```

To build PHP 8.1 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make buildx-php-81-magento-24
```

To also build PHP 8.1 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make buildx-php-81-magento-24-debug
```

##### 7.4 version

To build PHP 7.4 image with and without XDebug run the following command:
```bash
make buildx-php-74-all
```

To build PHP 7.4 image without XDebug run the following command:
```bash
make buildx-php-74 && make buildx-php-74-magento-24 && make buildx-php-74-magento-23
```

To also build PHP 7.4 image with XDebug run the following command:
```bash
make buildx-php-74-debug && make buildx-php-74-magento-24-debug && make buildx-php-74-magento-23-debug
```

##### 7.4 version with extensions for Magento 2.4

To build PHP 7.4 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make buildx-php-74-magento-24 && make buildx-php-74-magento-24-debug
```

To build PHP 7.4 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make buildx-php-74-magento-24
```

To also build PHP 7.4 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make buildx-php-74-magento-24-debug
```

##### 7.4 version with extensions for Magento 2.3

To build PHP 7.4 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make buildx-php-74-magento-23 && make buildx-php-74-magento-23-debug
```

To build PHP 7.4 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make buildx-php-74-magento-23
```

To also build PHP 7.4 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make buildx-php-74-magento-23-debug
```

##### 7.3 version

To build PHP 7.3 image with and without XDebug run the following command:
```bash
make buildx-php-73-all
```

To build PHP 7.3 image without XDebug run the following command:
```bash
make buildx-php-73 && make buildx-php-73-magento-23
```

To also build PHP 7.3 image with XDebug run the following command:
```bash
make buildx-php-73-debug && make buildx-php-73-magento-23-debug
```

##### 7.3 version with extensions for Magento 2.3

To build PHP 7.3 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make buildx-php-73-magento-23 && make buildx-php-73-magento-23-debug
```

To build PHP 7.3 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make buildx-php-73-magento-23
```

To also build PHP 7.3 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make buildx-php-73-magento-23-debug
```

##### 7.2 version

To build PHP 7.2 image with and without XDebug run the following command:
```bash
make buildx-php-72-all
```

To build PHP 7.2 image without XDebug run the following command:
```bash
make buildx-php-72 && make buildx-php-72-magento-23
```

To also build PHP 7.2 image with XDebug run the following command:
```bash
make buildx-php-72-debug && make buildx-php-72-magento-23-debug
```

##### 7.2 version with extensions for Magento 2.3

To build PHP 7.2 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make buildx-php-72-magento-23 && make buildx-php-72-magento-23-debug
```

To build PHP 7.2 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make buildx-php-72-magento-23
```

To also build PHP 7.2 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make buildx-php-72-magento-23-debug
```

### Build images for multiple CPU architectures (amd64, arm64) and push them to the GitHub Docker registry

#### All Images

To build AND publish all images you will need access to scandipwa packages and you can run the following command:
```bash
make buildxpush-all
```

#### PHP Images

##### All versions

To build PHP images with and without XDebug run the following command:
```bash
make buildxpush-all-php && make buildxpush-all-php-debug
```

To build PHP images without XDebug run the following command:
```bash
make buildxpush-all-php
```

To also build PHP images with XDebug run the following command:
```bash
make buildxpush-all-php-debug
```

##### 8.2 version

To build PHP 8.2 image with and without XDebug run the following command:
```bash
make buildxpush-php-82-all
```

To build PHP 8.2 image without XDebug run the following command:
```bash
make buildxpush-php-82 && make buildxpush-php-82-magento-24
```

To also build PHP 8.2 image with XDebug run the following command:
```bash
make buildxpush-php-82-debug && make buildxpush-php-82-magento-24-debug
```

##### 8.2 version with extensions for Magento 2.4

To build PHP 8.2 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make buildxpush-php-82-magento-24 && make buildxpush-php-82-magento-24-debug
```

To build PHP 8.2 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make buildxpush-php-82-magento-24
```

To also build PHP 8.2 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make buildxpush-php-82-magento-24-debug
```

##### 8.1 version

To build PHP 8.1 image with and without XDebug run the following command:
```bash
make buildxpush-php-81-all
```

To build PHP 8.1 image without XDebug run the following command:
```bash
make buildxpush-php-81 && make buildxpush-php-81-magento-24
```

To also build PHP 8.1 image with XDebug run the following command:
```bash
make buildxpush-php-81-debug && make buildxpush-php-81-magento-24-debug
```

##### 8.1 version with extensions for Magento 2.4

To build PHP 8.1 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make buildxpush-php-81-magento-24 && make buildxpush-php-81-magento-24-debug
```

To build PHP 8.1 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make buildxpush-php-81-magento-24
```

To also build PHP 8.1 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make buildxpush-php-81-magento-24-debug
```

##### 7.4 version

To build PHP 7.4 image with and without XDebug run the following command:
```bash
make buildxpush-php-74-all
```

To build PHP 7.4 image without XDebug run the following command:
```bash
make buildxpush-php-74 && make buildxpush-php-74-magento-24
```

To also build PHP 7.4 image with XDebug run the following command:
```bash
make buildxpush-php-74-debug && make buildxpush-php-74-magento-24-debug
```

##### 7.4 version with extensions for Magento 2.4

To build PHP 7.4 image with extensions for Magento 2.4 with and without XDebug run the following command:
```bash
make buildxpush-php-74-magento-24 && make buildxpush-php-74-magento-24-debug
```

To build PHP 7.4 image with extensions for Magento 2.4 without XDebug run the following command:
```bash
make buildxpush-php-74-magento-24
```

To also build PHP 7.4 image with extensions for Magento 2.4 with XDebug run the following command:
```bash
make buildxpush-php-74-magento-24-debug
```
##### 7.4 version with extensions for Magento 2.3

To build PHP 7.4 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make buildxpush-php-74-magento-23 && make buildxpush-php-74-magento-23-debug
```

To build PHP 7.4 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make buildxpush-php-74-magento-23
```

To also build PHP 7.4 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make buildxpush-php-74-magento-23-debug
```

##### 7.3 version

To build PHP 7.3 image with and without XDebug run the following command:
```bash
make buildxpush-php-73-all
```

To build PHP 7.3 image without XDebug run the following command:
```bash
make buildxpush-php-73 && make buildxpush-php-73-magento-23
```

To also build PHP 7.3 image with XDebug run the following command:
```bash
make buildxpush-php-73-debug && make buildxpush-php-73-magento-23-debug
```


##### 7.3 version with extensions for Magento 2.3

To build PHP 7.3 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make buildxpush-php-73-magento-23 && make buildxpush-php-73-magento-23-debug
```

To build PHP 7.3 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make buildxpush-php-73-magento-23
```

To also build PHP 7.3 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make buildxpush-php-73-magento-23-debug
```

##### 7.2 version

To build PHP 7.2 image with and without XDebug run the following command:
```bash
make buildxpush-php-72-all
```

To build PHP 7.2 image without XDebug run the following command:
```bash
make buildxpush-php-72 && make buildxpush-php-72-magento-23
```

To also build PHP 7.2 image with XDebug run the following command:
```bash
make buildxpush-php-72-debug && make buildxpush-php-72-magento-23
```

##### 7.2 version with extensions for Magento 2.3

To build PHP 7.2 image with extensions for Magento 2.3 with and without XDebug run the following command:
```bash
make buildxpush-php-72-magento-23 && make buildxpush-php-72-magento-23-debug
```

To build PHP 7.2 image with extensions for Magento 2.3 without XDebug run the following command:
```bash
make buildxpush-php-72-magento-23
```

To also build PHP 7.2 image with extensions for Magento 2.3 with XDebug run the following command:
```bash
make buildxpush-php-72-magento-23-debug
```