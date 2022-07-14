module.exports = {
    name: 'curl',
    command: 'docker-php-ext-install curl',
    dependencies: [
        'curl-dev',
        'libcurl'
    ]
};
