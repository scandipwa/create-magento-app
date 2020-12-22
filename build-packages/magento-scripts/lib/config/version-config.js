const magentoVersionConfigs = {
    '2.4.1': {
        php: {
            version: '7.4.13',
            extensions: [
                { name: 'gd' },
                { name: 'intl' },
                { name: 'zlib' },
                { name: 'openssl' },
                { name: 'sockets' },
                { name: 'SimpleXML' },
                { name: 'xdebug', version: '3.0.1' }
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
