FROM greyltc/archlinux-aur
SHELL ["/bin/bash", "-c"]

WORKDIR /usr/tempdir/

# Update deps
RUN pacman -Sy --noconfirm

# Install os deps
RUN pacman -S curl git libidn glibc base-devel --noconfirm

# Install docker
RUN pacman -S docker --noconfirm
RUN newgrp docker
# Install deps for magento-scripts
RUN pacman -S --noconfirm freetype2 \
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

# Install node
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n && bash n 14.15.1

# Install PHPBrew
# Clone and build a package
RUN su docker -c 'yay -S --noprogressbar --needed --noconfirm phpbrew'
# RUN chown -R builduser ./phpbrew
# WORKDIR /usr/tempdir/phpbrew
# RUN sudo makepkg -S --noconfirm

RUN echo "extension=bz2" | tee -a /etc/php/php.ini

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
CMD phpbrew init && yarn start --no-open --test-run