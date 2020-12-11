# Getting Started with Create Magneto App

## Installation

- [On Linux](#installation-on-linux)
- [On Mac](#installation-on-mac)

> Currently Create Magneto App **does not support Windows platform**.

## Available Scripts

### `npm start` or `yarn start`

This command executes a local deployment of your Magento 2 application. It does it in following steps:
- Prepare your project for Magento 2.
- Install and compile correct PHP version with required extensions to run Magento 2.
- Deploy services, Redis, MySQL, ElasticSearch and Nginx, in Docker containers for Magento 2.
- Install Magento 2 with Composer.
- Setup Magento 2.
- Open browser with up and running Magento 2 store.

**Command options**:
- **port** - A port to run your application on. *By default CMA will select a random available port.*

    ```bash
    yarn start --port <port> # for Yarn
    npm run start -- --port <port> # for NPM
    ```

- **no-open** - Disable auto-open of a browser window at the end of workflow.

    ```bash
    yarn start --no-open # for Yarn
    npm run start -- --no-open # for NPM
    ```

### `npm run stop` or `yarn stop`

This command stops a local deployment of your Magento 2 application. It does it in following steps:
- Gracefully stops PHP-FPM with running Magento.
- Gracefully stops Docker containers.

### `npm run cli` or `yarn cli`

Opens a new instance of Bash with aliases for PHP, Composer and Magento used in CMA project.

**Usage example**:
```bash
npm run cli

php -v
> PHP 7.4.13 (cli) ...

composer --version
> Composer version 1.10.19

# Can be used with alias
c --version
> Composer version 1.10.19

magento setup:upgrade
> ... magento upgrade output

# Can be used with alias
m se:up
> ...magento upgrade output
```

### `npm run logs -- <scope>` or `yarn logs <scope>`

Gives simple access to logs from Nginx, Redis, MySQL and ElasticSearch containers and Magento.

This command attaches logs from chosen service to your terminal so to exit press `CTRL + C`.

**Available scopes**:
- `mysql`
- `nginx`
- `redis`
- `elasticsearch`
- `magento`

**Usage example**:
```bash
yarn logs nginx

> ... nginx logs

# ctrl + c

# this is not alias, but rather service name matching
yarn logs n # or n

> ... nginx logs

# and for mysql
yarn logs m # or mysql

> ... mysql logs

# and for magento
yarn logs ma # or magento

> ... magento logs
```

### `npm run link <theme path>` or `yarn link <theme path>`

Installs ScandiPWA as a Magento Theme from your specified folder.

**Usage example**:
```bash
yarn link ./path/to/my/scandipwa-app
```

---

### Installation on Linux

#### 1. Install platform-specific dependencies:

```bash
# UBUNTU
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

# Linux Mint
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

# CENTOS / FEDORA
yum install --enablerepo=PowerTools \
    openssl-devel \
    libjpeg-turbo-devel \
    libpng-devel \
    gd-devel \
    libicu libicu-devel \
    libzip-devel \
    libtool-ltdl-devel \
    oniguruma-devel

# ARCH
pacman -S freetype2 \
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

#### 2. Install Docker

You can follow [official installation guide from Docker](https://docs.docker.com/engine/install/ubuntu/) or use commands below:
```bash
# Download installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# Run installation script
sudo bash get-docker.sh

# Add your user to the “docker” group to run docker without root.
sudo usermod -aG docker $USER

# After that you'll need to logout and login to your account or,
# you can temporarily enable group changes by running command below
newgrp docker
```

#### 3. Install PHPBrew

To install PHPBrew on linux you will need to follows [installation](https://github.com/phpbrew/phpbrew#installation) instructions or use commands below:

```bash
# Download PHPBrew
curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar

# Make it executable
chmod +x phpbrew.phar

# Move PHPBrew binary to system folder.
sudo mv phpbrew.phar /usr/local/bin/phpbrew

# Initialize PHPBrew
phpbrew init
```

#### 4. Prepare the environment

`COMPOSER_AUTH` is an environment variable that is used to authenticate your Magento project on Magento Composer Repository which contains Magento dependencies. TO obtain it:

1. Go to https://marketplace.magento.com/customer/accessKeys/
> NOTE: you have to be authorized.
2. Generate Access Key pair.
3. Replace `<public key>` and `<private key>` with your public and private key.
```bash
export COMPOSER_AUTH='{"http-basic":{"repo.magento.com": {"username": "<public key>", "password": "<private key>"}}}'
```
4. Add result result from steps above to your `.bashrc` or `.zshrc`.
5. Reload terminal.

#### 5. Start your application

```bash
yarn start # for Yarn
npm start # for NPM
```

### Installation on Mac

#### 1. Install Brew

Brew can be installed from [official website](https://brew.sh/) or you can copy-paste this command in your mac terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install MacOS Dependencies

Run command below to install required system dependencies.

```bash
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

#### 3. Install Docker for Mac

Download and install Docker Desktop for Mac following the [official installation guide](https://docs.docker.com/docker-for-mac/install/).

#### 4. Install PHPBrew

PHPBrew is used to compile PHP with required extensions to run Magento 2 on your system.

```bash
# Install XCode
xcode-select --install

# Install PHPBrew dependencies
brew install autoconf pkg-config

# Download PHPBrew
curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar

# Make it executable
chmod +x phpbrew.phar

# Move PHPBrew binary to system folder.
sudo mv phpbrew.phar /usr/local/bin/phpbrew

# Initialize PHPBrew
phpbrew init
```

#### 5. Prepare the environment

`COMPOSER_AUTH` is an environment variable that is used to authenticate your Magento project on Magento Composer Repository which contains Magento dependencies. TO obtain it:

1. Go to https://marketplace.magento.com/customer/accessKeys/
> NOTE: you have to be authorized.
2. Generate Access Key pair.
3. Replace `<public key>` and `<private key>` with your public and private key.
```bash
export COMPOSER_AUTH='{"http-basic":{"repo.magento.com": {"username": "<public key>", "password": "<private key>"}}}'
```
4. Add result result from steps above to your `.zshrc`.
5. Reload terminal.

#### 6. Start your application

```bash
yarn start # for Yarn
npm start # for NPM
```