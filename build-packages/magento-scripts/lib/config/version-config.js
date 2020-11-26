const magentoVersionConfigs = {
    '2.4.1': {
        php: {
            version: '7.4.11',
            extensions: [
                {
                    name: 'gd',
                    options: '--with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/ --with-freetype-dir=/usr/'
                },
                {
                    name: 'intl'
                    // macOptions: '--with-icu-dir=$(brew --prefix icu4c)'
                },
                { name: 'openssl' },
                { name: 'sockets' },
                { name: 'SimpleXML' }
            ]
        },
        nginx: '1.18.0',
        redis: 'alpine',
        mysql: '5.7',
        elasticsearch: '7.6.2'
    }
};

const allVersions = Object.keys(magentoVersionConfigs);

module.exports = {
    magentoVersionConfigs,
    allVersions
};
