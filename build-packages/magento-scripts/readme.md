# magento-scripts

This package contains scripts and configuration used by Create Magento App by [Create Magento App](https://github.com/scandipwa/create-magento-app).

## Overview

What this package does:
- Compiles correct php with all necessary extensions to run Magento on your system.
- Organize services required to run Magento on your system, such as Nginx, Redis, MySQL and Elasticsearch, in docker containers with forwarded ports to host system.
- Allows you to run multiple M2 projects simultaneously on the same machine without ports/files/context overlapping.

## Usage

```bash
> npx create-magento-app <folder name>
> cd <folder name>
> yarn/npm run start
```

To use commands such as `composer`, `magento` and `php` with correct version run command:
```bash
> yarn/npm cli
```
This will open bash with correct aliases to `php`, `magento` and `composer`.

To open logs use command `logs` with one of the scopes: `redis`, `mysql`, `elasticsearch`, `nginx` or `magento`.
```bash
> yarn/npm run logs nginx
> // nginx logs
```

> NOTE: you can use shortcuts for logs! Like `yarn logs m` will show `mysql` logs, `yarn logs ma` will show `magento` logs and e.t.c.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) ^19
- [phpbrew](https://github.com/phpbrew/phpbrew) ^1.25

For Mac
- MacOS 10.5 and newer
- Xcode 11 and newer You can find it.
- [Homebrew](https://brew.sh/)

## Dependencies

### Ubuntu

```sh
apt-get install \
    libcurl4-openssl-dev \
    libonig-dev \
    libjpeg-dev \
    libjpeg8-dev \
    libjpeg-turbo8-dev \
    libpng-dev \
    libicu-dev \
    libfreetype6-dev \
    libzip-dev \
    libssl-dev \
    build-essential \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    libonig-dev \
    php-cli \
    php-bz2 \
    pkg-config \
    autoconf
```

### Mint Linux

```
apt-get install \
    libjpeg-dev \
    libjpeg8-dev \
    libjpeg-turbo8-dev \
    libpng-dev \
    libicu-dev \
    libfreetype6-dev \
    libzip-dev \
    libssl-dev \
    build-essential \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    libonig-dev \
    php-cli \
    php-bz2 \
    pkg-config \
    autoconf \
    libcurl4-openssl-dev 
```

### CentsOS / Fedora
```sh
yum install --enablerepo=PowerTools openssl-devel \
    libjpeg-turbo-devel \
    libpng-devel \
    gd-devel \
    libicu libicu-devel \
    libzip-devel \
    libtool-ltdl-devel \
    oniguruma-devel
```

### Arch
```sh
pamac install freetype2 \
    openssl \
    oniguruma \
    libxslt \
    bzip2 \
    libjpeg-turbo \
    libpng \
    icu \
    libxml2 \
    autoconf \
    libzip \
    sqlite \
    readline \
    perl
```

### MacOS

```sh
sudo xcode-select -switch /Applications/Xcode.app
```
```sh
brew install zlib \
    bzip2 \
    libiconv \
    curl \
    libpng \
    gd \
    freetype \
    oniguruma \
    icu4c \
    libzip
```

Additional libraries:  
- Installed PHP with json extension.  
