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
                { name: 'xdebug', version: '3.0.2' }
            ]
        },
        nginx: '1.18.0',
        redis: 'alpine',
        mysql: '8.0',
        elasticsearch: '7.6.2'
    }
};

const allVersions = Object.keys(magentoVersionConfigs);

module.exports = {
    magentoVersionConfigs,
    allVersions
};
