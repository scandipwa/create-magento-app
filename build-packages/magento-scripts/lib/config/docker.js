const path = require('path');
const macosVersion = require('macos-version');

module.exports = ({ configuration, ssl }, config) => {
    const {
        nginx,
        redis,
        mysql,
        elasticsearch
    } = configuration;

    const {
        prefix,
        magentoDir,
        cacheDir
    } = config;

    const network = {
        name: `${ prefix }_network`
    };

    const volumes = {
        mysql: {
            name: `${ prefix }_mysql-data`
        },
        redis: {
            name: `${ prefix }_redis-data`
        },
        elasticsearch: {
            name: `${ prefix }_elasticsearch-data`
        },
        nginx: {
            name: `${ prefix }_nginx-data`,
            opts: {
                type: 'nfs',
                device: `${cacheDir}/nginx/conf.d`,
                o: 'bind'
            }
        },
        appPub: {
            name: `${ prefix }_pub-data`,
            opts: {
                type: 'nfs',
                device: `${ path.join(magentoDir, 'pub') }`,
                o: 'bind'
            }
        },
        appSetup: {
            name: `${ prefix }_setup-data`,
            opts: {
                type: 'nfs',
                device: `${path.join(magentoDir, 'setup')}`,
                o: 'bind'
            }
        }
    };

    const getContainers = (ports = {}) => {
        const dockerConfig = {
            nginx: {
                _: 'Nginx',
                ports: [
                    `127.0.0.1:${ ports.app }:80`
                ],
                healthCheck: {
                    cmd: 'service nginx status'
                },
                mountVolumes: [
                    `${ volumes.nginx.name }:/etc/nginx/conf.d`,
                    `${ volumes.appPub.name }:${path.join(magentoDir, 'pub')}`,
                    `${ volumes.appSetup.name }:${path.join(magentoDir, 'setup')}`
                ],
                restart: 'on-failure:5',
                // TODO: use connect instead
                network: macosVersion.isMacOS ? network.name : 'host',
                image: `nginx:${ nginx.version }`,
                imageDetails: {
                    name: 'nginx',
                    tag: nginx.version
                },
                name: `${ prefix }_nginx`,
                command: "nginx -g 'daemon off;'"
            },
            redis: {
                _: 'Redis',
                healthCheck: {
                    cmd: 'redis-cli ping'
                },
                ports: [`127.0.0.1:${ ports.redis }:6379`],
                mounts: [`source=${ volumes.redis.name },target=/data`],
                // TODO: use connect instead
                network: network.name,
                image: `redis:${ redis.version }`,
                imageDetails: {
                    name: 'redis',
                    tag: redis.version
                },
                name: `${ prefix }_redis`,
                connectCommand: ['redis-cli']
            },
            mysql: {
                _: 'MySQL',
                healthCheck: {
                    cmd: 'service mysql status'
                },
                ports: [`127.0.0.1:${ ports.mysql }:3306`],
                mounts: [`source=${ volumes.mysql.name },target=/var/lib/mysql`],
                env: {
                    MYSQL_PORT: 3306,
                    MYSQL_ROOT_PASSWORD: 'scandipwa',
                    MYSQL_USER: 'magento',
                    MYSQL_PASSWORD: 'magento',
                    MYSQL_DATABASE: 'magento'
                },
                securityOptions: [
                    'seccomp=unconfined'
                ],
                network: network.name,
                image: `mysql:${ mysql.version }`,
                imageDetails: {
                    name: 'mysql',
                    tag: mysql.version
                },
                name: `${ prefix }_mysql`
            },
            elasticsearch: {
                _: 'ElasticSearch',
                healthCheck: {
                    cmd: 'curl --silent --fail localhost:9200/_cluster/health || exit 1'
                },
                ports: [`127.0.0.1:${ ports.elasticsearch }:9200`],
                mounts: [`source=${ volumes.elasticsearch.name },target=/usr/share/elasticsearch/data`],
                env: {
                    'bootstrap.memory_lock': true,
                    'xpack.security.enabled': false,
                    'discovery.type': 'single-node',
                    ES_JAVA_OPTS: '"-Xms512m -Xmx512m"',
                    'xpack.ml.enabled': false
                },
                network: network.name,
                image: `docker.elastic.co/elasticsearch/elasticsearch:${ elasticsearch.version }`,
                imageDetails: {
                    name: 'docker.elastic.co/elasticsearch/elasticsearch',
                    tag: elasticsearch.version
                },
                name: `${ prefix }_elasticsearch`
            }
        };

        if (ssl.enabled) {
            dockerConfig.nginx.ports.push(
                '127.0.0.1:443:443'
            );
        }

        return dockerConfig;
    };

    return {
        network,
        volumes,
        getContainers
    };
};
