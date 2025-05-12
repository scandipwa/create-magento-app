# global control

build-all: build-elasticsearch build-all-php
buildx-all: buildx-elasticsearch buildx-all-php
buildxpush-all: buildxpush-elasticsearch buildxpush-all-php

build-all-php: build-php build-php-with-magento-extensions
buildx-all-php: buildx-php buildx-php-with-magento-extensions
buildxpush-all-php: buildxpush-php buildxpush-php-with-magento-extensions

pull-all: pull-elasticsearch pull-all-php
pull-all-php: pull-php pull-php-with-magento-extensions

build-elasticsearch: build-elasticsearch-68

buildx-elasticsearch: buildx-elasticsearch-68

buildxpush-elasticsearch: buildxpush-elasticsearch-68

pull-elasticsearch: pull-elasticsearch-68

pull-php: pull-php-72 pull-php-73 pull-php-74 pull-php-81 pull-php-82 pull-php-83 pull-php-84

build-php: build-php-72 build-php-73 build-php-74 build-php-81 build-php-82 build-php-83

buildx-php: buildx-php-72 buildx-php-73 buildx-php-74 buildx-php-81 buildx-php-82 buildx-php-83

buildxpush-php: buildxpush-php-72 buildxpush-php-73 buildxpush-php-74 buildxpush-php-81 buildxpush-php-82 buildxpush-php-83 buildxpush-php-84

buildxpush-php-8-all: buildxpush-php-81-all buildxpush-php-82-all buildxpush-php-83-all buildxpush-php-84-all

buildxpush-php-81-all: buildxpush-php-81 buildxpush-php-81-magento-24
buildxpush-php-82-all: buildxpush-php-82 buildxpush-php-82-magento-24
buildxpush-php-83-all: buildxpush-php-83 buildxpush-php-83-magento-24
buildxpush-php-84-all: buildxpush-php-84-magento-24

pull-php-with-magento-extensions: pull-php-72-magento-23 pull-php-73-magento-23 pull-php-74-magento-23 pull-php-74-magento-24 pull-php-81-magento-24 pull-php-82-magento-24 pull-php-83-magento-24 pull-php-84-magento-24

build-php-with-magento-extensions: build-php-72-magento-23 build-php-73-magento-23 build-php-74-magento-23 build-php-74-magento-24 build-php-81-magento-24 build-php-82-magento-24 build-php-83-magento-24 build-php-84-magento-24

buildx-php-with-magento-extensions: buildx-php-72-magento-23 buildx-php-73-magento-23 buildx-php-74-magento-23 buildx-php-74-magento-24 buildx-php-81-magento-24 buildx-php-82-magento-24 buildx-php-83-magento-24 buildx-php-84-magento-24

buildxpush-php-with-magento-extensions: buildxpush-php-72-magento-23 buildxpush-php-73-magento-23 buildxpush-php-74-magento-23 buildxpush-php-74-magento-24 buildxpush-php-81-magento-24 buildxpush-php-82-magento-24 buildxpush-php-83-magento-24 buildxpush-php-84-magento-24

### ELASTICSEARCH

# elasticsearch 6.8
build-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) build;

buildx-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) buildx;

buildxpush-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) buildxpush && $(MAKE) pull;

pull-elasticsearch-68:
	cd ./elasticsearch-6.8 && $(MAKE) pull;

### PHP

# php 7.2
build-php-72:
	cd ./php-7.2 && $(MAKE) build;

buildx-php-72:
	cd ./php-7.2 && $(MAKE) buildx;

buildxpush-php-72:
	cd ./php-7.2 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-72:
	cd ./php-7.2 && $(MAKE) pull;

# php 7.2 magento 2.3
build-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) build;

buildx-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) buildx;

buildxpush-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-72-magento-23:
	cd ./php-7.2-magento-2.3 && $(MAKE) pull;

# php 7.2 all
pull-php-72-all: pull-php-72 pull-php-72-magento-23
build-php-72-all: build-php-72 build-php-72-magento-23
buildx-php-72-all: buildx-php-72 buildx-php-72-magento-23
buildxpush-php-72-all: buildxpush-php-72 buildxpush-php-72-magento-23

# php 7.3
build-php-73:
	cd ./php-7.3 && $(MAKE) build;

buildx-php-73:
	cd ./php-7.3 && $(MAKE) buildx;

buildxpush-php-73:
	cd ./php-7.3 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-73:
	cd ./php-7.3 && $(MAKE) pull;

# php 7.3 magento 2.3
build-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) build;

buildx-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) buildx;

buildxpush-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-73-magento-23:
	cd ./php-7.3-magento-2.3 && $(MAKE) pull;

# php 7.3 all
pull-php-73-all: pull-php-73 pull-php-73-magento-23
build-php-73-all: build-php-73 build-php-73-magento-23
buildx-php-73-all: buildx-php-73 buildx-php-73-magento-23
buildxpush-php-73-all: buildxpush-php-73 buildxpush-php-73-magento-23

# php 7.4
build-php-74:
	cd ./php-7.4 && $(MAKE) build;

buildx-php-74:
	cd ./php-7.4 && $(MAKE) buildx;

buildxpush-php-74:
	cd ./php-7.4 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-74:
	cd ./php-7.4 && $(MAKE) pull;

# php 7.4 magento 2.3
build-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) build;

buildx-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) buildx;

buildxpush-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-74-magento-23:
	cd ./php-7.4-magento-2.3 && $(MAKE) pull;

# php 7.4 magento 2.4
build-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) build;

buildx-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) buildx;

buildxpush-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-74-magento-24:
	cd ./php-7.4-magento-2.4 && $(MAKE) pull;

# php 7.4 all
pull-php-74-all: pull-php-74 pull-php-74-magento-24 pull-php-74-magento-23
build-php-74-all: build-php-74 build-php-74-magento-24 build-php-74-magento-23
buildx-php-74-all: buildx-php-74 buildx-php-74-magento-24 buildx-php-74-magento-23
buildxpush-php-74-all: buildxpush-php-74 buildxpush-php-74-magento-24 buildxpush-php-74-magento-23

# php 8.1
build-php-81:
	cd ./php-8.1 && $(MAKE) build;

buildx-php-81:
	cd ./php-8.1 && $(MAKE) buildx;

buildxpush-php-81:
	cd ./php-8.1 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-81:
	cd ./php-8.1 && $(MAKE) pull;

# php 8.1 magento 2.4
build-php-81-magento-24:
	cd ./php-8.1-magento-2.4 && $(MAKE) build;

buildx-php-81-magento-24:
	cd ./php-8.1-magento-2.4 && $(MAKE) buildx;

buildxpush-php-81-magento-24:
	cd ./php-8.1-magento-2.4 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-81-magento-24:
	cd ./php-8.1-magento-2.4 && $(MAKE) pull;

# php 8.1 all
pull-php-81-all: pull-php-81 pull-php-81-magento-24
build-php-81-all: build-php-81 build-php-81-magento-24
buildx-php-81-all: buildx-php-81 buildx-php-81-magento-24
buildxpush-php-81-all: buildxpush-php-81 buildxpush-php-81-magento-24

# php 8.2
build-php-82:
	cd ./php-8.2 && $(MAKE) build;

buildx-php-82:
	cd ./php-8.2 && $(MAKE) buildx;

buildxpush-php-82:
	cd ./php-8.2 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-82:
	cd ./php-8.2 && $(MAKE) pull;

# php 8.2 magento 2.4
build-php-82-magento-24:
	cd ./php-8.2-magento-2.4 && $(MAKE) build;

buildx-php-82-magento-24:
	cd ./php-8.2-magento-2.4 && $(MAKE) buildx;

buildxpush-php-82-magento-24:
	cd ./php-8.2-magento-2.4 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-82-magento-24:
	cd ./php-8.2-magento-2.4 && $(MAKE) pull;

# php 8.2 all
pull-php-82-all: pull-php-82 pull-php-82-magento-24
build-php-82-all: build-php-82 build-php-82-magento-24
buildx-php-82-all: buildx-php-82 buildx-php-82-magento-24
buildxpush-php-82-all: buildxpush-php-82 buildxpush-php-82-magento-24

# php 8.3
build-php-83:
	cd ./php-8.3 && $(MAKE) build;

buildx-php-83:
	cd ./php-8.3 && $(MAKE) buildx;

buildxpush-php-83:
	cd ./php-8.3 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-83:
	cd ./php-8.3 && $(MAKE) pull;

# php 8.3 magento 2.4
build-php-83-magento-24:
	cd ./php-8.3-magento-2.4 && $(MAKE) build;

buildx-php-83-magento-24:
	cd ./php-8.3-magento-2.4 && $(MAKE) buildx;

buildxpush-php-83-magento-24:
	cd ./php-8.3-magento-2.4 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-83-magento-24:
	cd ./php-8.3-magento-2.4 && $(MAKE) pull;

# php 8.3 all
pull-php-83-all: pull-php-83 pull-php-83-magento-24
build-php-83-all: build-php-83 build-php-83-magento-24
buildx-php-83-all: buildx-php-83 buildx-php-83-magento-24
buildxpush-php-83-all: buildxpush-php-83 buildxpush-php-83-magento-24

# php 8.4 magento 2.4
build-php-84-magento-24:
	cd ./php-8.4-magento-2.4 && $(MAKE) build;

buildx-php-84-magento-24:
	cd ./php-8.4-magento-2.4 && $(MAKE) buildx;

buildxpush-php-84-magento-24:
	cd ./php-8.4-magento-2.4 && $(MAKE) buildxpush && $(MAKE) pull;

pull-php-84-magento-24:
	cd ./php-8.4-magento-2.4 && $(MAKE) pull;

# php 8.4 all
pull-php-84-all: pull-php-84-magento-24
build-php-84-all: build-php-84-magento-24
buildx-php-84-all: buildx-php-84-magento-24
buildxpush-php-84-all: buildxpush-php-84-magento-24