# CMA usage guide

Follow these steps to install dependencies, prepare environment and run Magento 2 on your system!

---

## Requirements

To run Create Magento App it's required to have installed Docker, PHPBrew and Node on one of the supported systems.  

Supported systems:
- MacOS Catalina/Big Sur with Xcode 11/12
- Ubuntu 20.04
- Mint Linux 20.04
- CentOS 8
- Fedora 33
> Older versions of those operation systems aren't tested yet, so you can probably run it just fine.

---

# First step: install dependencies

## Dependencies for MacOS

### Install Brew

Brew can be installed from [official website](https://brew.sh/) or you can copy-paste this command in your mac terminal:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Install MacOS Dependencies

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

## Dependencies for Linux (supported distros)

### Dependencies for Ubuntu

Run command below to install required system dependencies.

```bash
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

### Dependencies for Mint Linux

Run command below to install required system dependencies.

```bash
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

### Dependencies for CentsOS / Fedora

Run command below to install required system dependencies.

```bash
yum install --enablerepo=PowerTools openssl-devel \
    libjpeg-turbo-devel \
    libpng-devel \
    gd-devel \
    libicu libicu-devel \
    libzip-devel \
    libtool-ltdl-devel \
    oniguruma-devel
```

### Dependencies for Arch Linux

Run command below to install required system dependencies.

```bash
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

---

# Second step: install utilities

## Install Docker

Magento 2 requires a few additional services to run: Redis, MySQL, ElasticSearch and Nginx.  

To achieve services isolation there're running inside a Docker container.  
So first we need to install Docker on our system.  

### Install Docker on Linux
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

### Install Docker on Mac
[Download and install Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/install/).

## Install Node.js

We're recommend to use [**n**](https://github.com/tj/n) Node version manager.  
Follow [installation guide](https://github.com/tj/n#installation) or use commands below:
```bash
# Download installation script and run it
curl -L https://git.io/n-install | bash

# Install LTS version of Node.js
n lts
```

## Install PHPBrew

PHPBrew is used to compile PHP with required extensions to run Magento 2 on your system.

### PHPBrew for MacOS

To install PHPBrew on linux you will need to install [requirements](https://github.com/phpbrew/phpbrew/wiki/Requirement) or use commands below:

```bash
# Install XCode
xcode-select --install

# Install PHPBrew dependencies
brew install autoconf pkg-config
```
>NOTE: It might give you an error **command line tools are already installed, use "Software Update" to install updates** and that means that you don't have to do anything.

### PHPBrew for Arch Linux

On Arch Linux you can install PHPBrew using [AUR](https://aur.archlinux.org/packages/phpbrew). Use [official guide](https://wiki.archlinux.org/index.php/Arch_User_Repository) or install one of the [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers).  
>For example, on Manjaro Linux you need to enable installation from AUR in pamac package manager. (Go to Add/Remove Software > Preferences > AUR and enable AUR support and then run command below.):
```bash
pamac install phpbrew
```

Then you will need to init PHPBrew and add it bash script to your `.bashrc` or `.zshrc` file:
```bash
phpbrew init

[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc
```

After that you might need to reload your terminal.

> IMPORTANT FOR MANJARO USERS  
You need to enable bz2 exception by un-commenting relevant entry `/etc/php/php.ini` file


### Install PHPBrew

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

And finally these lines to your `.bashrc` or `.zshrc` file:
```bash
[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc
```

After that you might need to reload your terminal.

---

# Third step: prepare environment

`COMPOSER_AUTH` is an environment variable that is used to authenticate your Magento project on Magento Composer Repository which contains Magento dependencies.

Follow step 5 from [our docs](https://docs.scandipwa.com/start-and-upgrade/linux-docker-setup#when-you-are-ready) or use guide below:

1. Go to https://marketplace.magento.com/customer/accessKeys/
> NOTE: you have to be authorized.
2. Generate Access Key pair.
3. Replace `<public key>` and `<private key>` with your public and private key.
```bash
export COMPOSER_AUTH='{"http-basic":{"repo.magento.com": {"username": "<public key>", "password": "<private key>"}}}'
```
4. Add result result from steps above to your `.bashrc` or `.zshrc`.
5. Reload terminal.

---

# Final step: create magento app

We are finally here.  
Run command below and follow the instructions.

```bash
npx create-magento-app <folder name>
```
