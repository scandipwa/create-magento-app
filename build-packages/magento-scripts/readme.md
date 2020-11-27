# magento-scripts

This package contains scripts and configuration used by Create Magento App by [Create Magento App](https://github.com/scandipwa/create-magento-app).

## Usage

```bash
> create-magento-app <folder name>
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

## Requirements

- [Docker](https://docs.docker.com/get-docker/) ^19
- [phpbrew](https://github.com/phpbrew/phpbrew) ^1.25

For Mac
- MacOS 10.5 and newer
- Xcode 11. You can find it [here](https://developer.apple.com/download/more/) ([Why 11?](https://github.com/Homebrew/homebrew-core/pull/61820#issuecomment-702787649))  
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
    php-cli \
    php-bz2 \
    pkg-config \
    autoconf \
    libcurl4-openssl-dev 
```

### CentsOS / Fedora
```sh
yum install openssl-devel \
    libjpeg-turbo-devel \
    libpng-devel \
    gd-devel \
    libicu libicu-devel \
    libzip-devel \
    libtool-ltdl-devel
```

### Arch
```sh
pamac install freetype2 \
    lib32-freetype2 \
    openssl
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
    icu4c
```

You'll need to add this line to your .bashrc/.zshrc file to be able properly compile intl extension.
```bash
export PKG_CONFIG_PATH="/usr/local/opt/icu4c/lib/pkgconfig"
```

Additional libraries:  
- Installed PHP with json extension.  
