FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /root
SHELL [ "/bin/bash", "-c" ]

ENV PHP_VERSION=8.1.8 \
    PHPBREW_ROOT=/root/.phpbrew \
    PHPBREW_HOME=/root/.phpbrew

RUN apt-get update

RUN apt-get install curl php php-phar --yes

RUN curl -L -O https://github.com/phpbrew/phpbrew/raw/master/phpbrew
RUN chmod +x phpbrew
RUN mv phpbrew /usr/local/bin/phpbrew
RUN phpbrew init

RUN source ${PHPBREW_HOME}/bashrc

RUN apt-get install \
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
    libxslt1-dev \
    libonig-dev \
    php-cli \
    php-bz2 \
    pkg-config \
    autoconf \
    libsodium-dev \
    cmake --yes

ENV CXX='g++ -DTRUE=1 -DFALSE=0' \
    CC='gcc -DTRUE=1 -DFALSE=0'

RUN phpbrew install -j $(nproc) ${PHP_VERSION} +bz2 +bcmath +ctype +curl +intl +dom +filter +hash +sockets +iconv +json +mbstring +openssl +xml +mysql +pdo +soap +xml +zip +fpm +gd -- --with-freetype-dir=/usr/include/freetype2 --with-openssl=/usr/ --with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/

RUN source ${PHPBREW_HOME}/bashrc \
    && phpbrew use ${PHP_VERSION}

CMD ["/bin/bash"]