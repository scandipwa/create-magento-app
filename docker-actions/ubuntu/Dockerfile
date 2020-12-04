# Container image that runs your code
FROM ubuntu:20.10

SHELL ["/bin/bash", "-c"]

USER root

# https://rtfm.co.ua/en/docker-configure-tzdata-and-timezone-during-build/
ENV TZ=Europe/Kiev
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/tempdir/

# Update deps
RUN apt-get update -y

# Install os deps
RUN apt-get install -y \
    curl

# Install docker
RUN apt install -y apt-transport-https ca-certificates curl software-properties-common

RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
RUN apt-get update && apt-get install docker-ce -y
RUN newgrp docker
# Install deps for magento-scripts
RUN apt-get install -y \
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

# Install node
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n && bash n 14.15.1

# Install PHPBrew
RUN curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar && chmod +x phpbrew.phar
RUN mv phpbrew.phar /usr/local/bin/phpbrew
RUN phpbrew init
RUN phpbrew lookup-prefix ubuntu
RUN source $HOME/.phpbrew/bashrc

WORKDIR /usr/src/app/

ADD ./build-packages/ /usr/src/app/build-packages/
ADD ./.yarn /usr/src/app/.yarn/
ADD ./package.json /usr/src/app/
ADD ./lerna.json /usr/src/app/
ADD ./yarn.lock /usr/src/app/
ADD ./.yarnrc /usr/src/app/

ARG COMPOSER_AUTH
ENV COMPOSER_AUTH=${COMPOSER_AUTH}

RUN npm i yarn -g
# Setup lerna workspace
RUN yarn

# Create sample cma project
RUN ./build-packages/create-magento-app/index.js runtime-packages/cma

WORKDIR /usr/src/app/runtime-packages/cma

# Start project
CMD yarn start --no-open --test-run