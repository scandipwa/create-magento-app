# global control

build-all: build-elasticsearch build-all-php build-all-php-debug
buildx-all: buildx-elasticsearch buildx-all-php buildx-all-php-debug
buildxpush-all: buildxpush-elasticsearch buildxpush-all-php buildxpush-all-php-debug

build-all-php: build-php build-php-with-magento-extensions
buildx-all-php: buildx-php buildx-php-with-magento-extensions
buildxpush-all-php: buildxpush-php buildxpush-php-with-magento-extensions

build-all-php-debug: build-php-debug build-php-debug-with-magento-extensions
buildx-all-php-debug: buildx-php-debug buildx-php-debug-with-magento-extensions
buildxpush-all-php-debug: buildxpush-php-debug buildxpush-php-debug-with-magento-extensions

build-elasticsearch: build-elasticsearch-68

buildx-elasticsearch: buildx-elasticsearch-68

buildxpush-elasticsearch: buildxpush-elasticsearch-68

build-php: build-php-72 build-php-73 build-php-74 build-php-81
build-php-debug: build-php-72-debug build-php-73-debug build-php-74-debug build-php-81-debug

buildx-php: buildx-php-72 buildx-php-73 buildx-php-74 buildx-php-81
buildx-php-debug: buildx-php-72-debug buildx-php-73-debug buildx-php-74-debug buildx-php-81-debug

buildxpush-php: buildxpush-php-72 buildxpush-php-73 buildxpush-php-74 buildxpush-php-81
buildxpush-php-debug: buildxpush-php-72-debug buildxpush-php-73-debug buildxpush-php-74-debug buildxpush-php-81-debug

build-php-with-magento-extensions: build-php-72-magento-23 build-php-73-magento-23 build-php-74-magento-23 build-php-74-magento-24 build-php-81-magento-24
build-php-debug-with-magento-extensions: build-php-72-magento-23-debug build-php-73-magento-23-debug build-php-74-magento-23-debug build-php-74-magento-24-debug build-php-81-magento-24-debug

buildx-php-with-magento-extensions: buildx-php-72-magento-23 buildx-php-73-magento-23 buildx-php-74-magento-23 buildx-php-74-magento-24 buildx-php-81-magento-24
buildx-php-debug-with-magento-extensions: buildx-php-72-magento-23-debug buildx-php-73-magento-23-debug buildx-php-74-magento-23-debug buildx-php-74-magento-24-debug buildx-php-81-magento-24-debug

buildxpush-php-with-magento-extensions: buildxpush-php-72-magento-23 buildxpush-php-73-magento-23 buildxpush-php-74-magento-23 buildxpush-php-74-magento-24 buildxpush-php-81-magento-24
buildxpush-php-debug-with-magento-extensions: buildxpush-php-72-magento-23-debug buildxpush-php-73-magento-23-debug buildxpush-php-74-magento-23-debug buildxpush-php-74-magento-24-debug buildxpush-php-81-magento-24-debug

### ELASTICSEARCH

# elasticsearch 6.8
build-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) build;

buildx-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) buildx;

buildxpush-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) buildxpush;

### PHP

# php 7.2
build-php-72:
	cd ./php-7.2 && $(MAKE) build;

buildx-php-72:
	cd ./php-7.2 && $(MAKE) buildx;

buildxpush-php-72:
	cd ./php-7.2 && $(MAKE) buildxpush;

# php 7.2 with xdebug
build-php-72-debug:
	cd ./php-7.2-debug && $(MAKE) build;

buildx-php-72-debug:
	cd ./php-7.2-debug && $(MAKE) buildx;

buildxpush-php-72-debug:
	cd ./php-7.2-debug && $(MAKE) buildxpush;

# php 7.2 magento 2.3
build-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) build;

buildx-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) buildx;

buildxpush-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) buildxpush;

# php 7.2 magento 2.3 with xdebug
build-php-72-magento-23-debug:
	cd ./php-7.2-magento-2.3-debug && $(MAKE) build;

buildx-php-72-magento-23-debug:
	cd ./php-7.2-magento-2.3-debug && $(MAKE) buildx;

buildxpush-php-72-magento-23-debug:
	cd ./php-7.2-magento-2.3-debug && $(MAKE) buildxpush;

# php 7.3
build-php-73:
	cd ./php-7.3 && $(MAKE) build;

buildx-php-73:
	cd ./php-7.3 && $(MAKE) buildx;

buildxpush-php-73:
	cd ./php-7.3 && $(MAKE) buildxpush;

# php 7.3 with xdebug
build-php-73-debug:
	cd ./php-7.3-debug && $(MAKE) build;

buildx-php-73-debug:
	cd ./php-7.3-debug && $(MAKE) buildx;

buildxpush-php-73-debug:
	cd ./php-7.3-debug && $(MAKE) buildxpush;

# php 7.3 magento 2.3
build-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) build;

buildx-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) buildx;

buildxpush-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) buildxpush;

# php 7.3 magento 2.3 with xdebug
build-php-73-magento-23-debug:
	cd ./php-7.3-magento-2.3-debug && $(MAKE) build;

buildx-php-73-magento-23-debug:
	cd ./php-7.3-magento-2.3-debug && $(MAKE) buildx;

buildxpush-php-73-magento-23-debug:
	cd ./php-7.3-magento-2.3-debug && $(MAKE) buildxpush;

# php 7.4
build-php-74:
	cd ./php-7.4 && $(MAKE) build;

buildx-php-74:
	cd ./php-7.4 && $(MAKE) buildx;

buildxpush-php-74:
	cd ./php-7.4 && $(MAKE) buildxpush;

# php 7.4 with xdebug
build-php-74-debug:
	cd ./php-7.4-debug && $(MAKE) build;

buildx-php-74-debug:
	cd ./php-7.4-debug && $(MAKE) buildx;

buildxpush-php-74-debug:
	cd ./php-7.4-debug && $(MAKE) buildxpush;

# php 7.4 magento 2.3
build-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) build;

buildx-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) buildx;

buildxpush-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) buildxpush;

# php 7.4 magento 2.3 with xdebug
build-php-74-magento-23-debug:
	cd ./php-7.4-magento-2.3-debug && $(MAKE) build;

buildx-php-74-magento-23-debug:
	cd ./php-7.4-magento-2.3-debug && $(MAKE) buildx;

buildxpush-php-74-magento-23-debug:
	cd ./php-7.4-magento-2.3-debug && $(MAKE) buildxpush;

# php 7.4 magento 2.4
build-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) build;

buildx-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) buildx;

buildxpush-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) buildxpush;

# php 7.4 magento 2.4 with xdebug
build-php-74-magento-24-debug:
	cd ./php-7.4-magento-2.4-debug && $(MAKE) build;

buildx-php-74-magento-24-debug:
	cd ./php-7.4-magento-2.4-debug && $(MAKE) buildx;

buildxpush-php-74-magento-24-debug:
	cd ./php-7.4-magento-2.4-debug && $(MAKE) buildxpush;

# php 8.1
build-php-81:
	cd ./php-8.1 && $(MAKE) build;

buildx-php-81:
	cd ./php-8.1 && $(MAKE) buildx;

buildxpush-php-81:
	cd ./php-8.1 && $(MAKE) buildxpush;

# php 8.1 with xdebug
build-php-81-debug:
	cd ./php-8.1-debug && $(MAKE) build;

buildx-php-81-debug:
	cd ./php-8.1-debug && $(MAKE) buildx;

buildxpush-php-81-debug:
	cd ./php-8.1-debug && $(MAKE) buildxpush;
