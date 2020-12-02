FROM archlinux:base-20201129.0.10056
SHELL ["/bin/bash", "-c"]

# https://rtfm.co.ua/en/docker-configure-tzdata-and-timezone-during-build/
ENV TZ=Europe/Kiev
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/tempdir/

# Update deps
RUN pacman -Sy --noconfirm

# Install os deps
RUN pacman -S curl git --noconfirm

# Install docker
RUN pacman -S docker --noconfirm
RUN newgrp docker
# Install deps for magento-scripts
RUN pacman -S --noconfirm freetype2 \
    openssl \
    oniguruma

# Install node
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n && bash n 14.15.1

# Install PHPBrew
RUN git clone https://aur.archlinux.org/phpbrew.git
WORKDIR /usr/tempdir/phpbrew
RUN makepkg -si

RUN phpbrew init
RUN phpbrew lookup-prefix ubuntu
RUN source $HOME/.phpbrew/bashrc

WORKDIR /usr/src/app/

ADD ./build-packages/ /usr/src/app/build-packages/
ADD ./.yarn /usr/src/app/
ADD ./package.json /usr/src/app/
ADD ./lerna.json /usr/src/app/
ADD ./yarn.lock /usr/src/app/

ARG COMPOSER_AUTH
ENV COMPOSER_AUTH=${COMPOSER_AUTH}

RUN npm i yarn@1.18.0 -g
# Setup lerna workspace
RUN yarn

# Create sample cma project
RUN ./build-packages/create-magento-app/index.js runtime-packages/cma

WORKDIR /usr/src/app/runtime-packages/cma

# Start project
CMD yarn start --no-open