const os = require('os');
const path = require('path');
const getPhpConfig = require('./php-config');
const { isIpAddress } = require('../util/ip');

const systeminformation = require('systeminformation');

/**
 *
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {import('../../typings/context').ListrContext['config']['overridenConfiguration']} overridenConfiguration
 * @param {import('../../typings/context').ListrContext['config']['baseConfig']} baseConfig
 * @returns
 */
module.exports = async (ctx, overridenConfiguration, baseConfig) => {
    const { configuration, ssl, host } = overridenConfiguration;
    const {
        nginx,
        redis,
        elasticsearch,
        mariadb,
        varnish
    } = configuration;

    const php = getPhpConfig(configuration, baseConfig);
    const {
        prefix,
        magentoDir,
        containerMagentoDir,
        cacheDir
    } = baseConfig;

    const cpuSupportedFlags = await systeminformation.cpuFlags();

    const network = {
        name: `${ prefix }_network`
    };

    const volumes = {
        mariadb: {
            name: `${ prefix }_mariadb-data`
        },
        redis: {
            name: `${ prefix }_redis-data`
        },
        elasticsearch: {
            name: `${ prefix }_elasticsearch-data`
        },
        composer_home: {
            name: 'composer_home-data'
        }
    };

    const isLinux = ctx.platform === 'linux';
    const { isWsl } = ctx;
    const isNotNativeLinux = (!isLinux || isWsl);

    if (!isLinux) {
        /**
         * When CMA is running in non-native linux environment,
         * we need also create named volumes for nginx to avoid performance penalty
         */
        volumes.php = {
            name: `${ prefix }_project-data`,
            opt: {
                type: 'nfs',
                device: path.join(magentoDir),
                o: 'bind'
            }
        };
        volumes.nginx = {
            name: `${ prefix }_nginx-data`,
            opt: {
                type: 'nfs',
                device: path.join(cacheDir, 'nginx', 'conf.d'),
                o: 'bind'
            }
        };
        volumes.appPub = {
            name: `${ prefix }_pub-data`,
            opt: {
                type: 'nfs',
                device: path.join(magentoDir, 'pub'),
                o: 'bind'
            }
        };
        volumes.appSetup = {
            name: `${ prefix }_setup-data`,
            opt: {
                type: 'nfs',
                device: path.join(magentoDir, 'setup'),
                o: 'bind'
            }
        };
        volumes.sslTerminator = {
            name: `${ prefix }_ssl-terminator-data`,
            opt: {
                type: 'nfs',
                device: path.join(cacheDir, 'ssl-terminator', 'conf.d'),
                o: 'bind'
            }
        };

        if (varnish.enabled) {
            volumes.varnish = {
                name: `${ prefix }_varnish-data`,
                opt: {
                    type: 'nfs',
                    device: path.join(cacheDir, 'varnish'),
                    o: 'bind'
                }
            };
        }
    }

    const getContainers = (ports = {}) => {
        /**
         * @type {Record<string, import('../tasks/docker/containers/container-api').ContainerRunOptions>}
         */
        const dockerConfig = {
            php: {
                _: 'PHP',
                ports: isNotNativeLinux ? [
                    `${ isIpAddress(host) ? host : '127.0.0.1' }:${ ports.fpm }:9000`
                ] : [],
                forwardedPorts: [
                    isNotNativeLinux
                        ? `127.0.0.1:${ ports.fpm }:9000`
                        : `127.0.0.1:${ ports.fpm }`
                ],
                network: isNotNativeLinux ? network.name : 'host',
                mountVolumes: [
                    `${ isLinux ? magentoDir : volumes.php.name }:${containerMagentoDir}`,
                    `${ volumes.composer_home.name }:/composer/home`,
                    `${ php.iniPath }:/usr/local/etc/php/php.ini`,
                    `${ php.fpmConfPath }:/usr/local/etc/php-fpm.d/zz-docker.conf`
                ],
                env: {
                    COMPOSER_AUTH: process.env.COMPOSER_AUTH || '',
                    COMPOSER_HOME: '/composer/home'
                },
                restart: 'on-failure:5',
                image: `local-cma-project:${ prefix }`,
                debugImage: `local-cma-project:${ prefix }.debug`,
                remoteImages: [
                    configuration.php.baseImage,
                    configuration.php.debugImage
                ],
                name: `${ prefix }_php`,
                connectCommand: ['/bin/sh'],
                user: isLinux ? `${os.userInfo().uid}:${os.userInfo().gid}` : ''
            },
            sslTerminator: {
                _: 'SSL Terminator (Nginx)',
                ports: isNotNativeLinux ? [
                    `${ isIpAddress(host) ? host : '127.0.0.1' }:${ ports.sslTerminator }:80`
                ] : [],
                forwardedPorts: [
                    isNotNativeLinux
                        ? `127.0.0.1:${ ports.sslTerminator }:80`
                        : `127.0.0.1:${ ports.sslTerminator }`
                ],
                healthCheck: {
                    cmd: 'service nginx status'
                },
                /**
                 * Mount volumes directly on linux
                 */
                mountVolumes: [
                    `${ isLinux ? path.join(cacheDir, 'ssl-terminator', 'conf.d') : volumes.sslTerminator.name }:/etc/nginx/conf.d`
                ],
                restart: 'on-failure:5',
                network: isNotNativeLinux ? network.name : 'host',
                image: `${ nginx.version ? `nginx:${ nginx.version }` : nginx.image }`,
                name: `${ prefix }_ssl-terminator`,
                command: "nginx -g 'daemon off;'"
            },
            nginx: {
                _: 'Nginx',
                ports: isNotNativeLinux ? [
                    `${ isIpAddress(host) ? host : '127.0.0.1' }:${ ports.app }:80`
                ] : [],
                forwardedPorts: [
                    isNotNativeLinux
                        ? `127.0.0.1:${ ports.app }:80`
                        : `127.0.0.1:${ ports.app }`
                ],
                healthCheck: {
                    cmd: 'service nginx status'
                },
                /**
                 * Mount volumes directly on linux
                 */
                mountVolumes: isLinux ? [
                    `${ cacheDir }/nginx/conf.d:/etc/nginx/conf.d`,
                    `${ path.join(magentoDir, 'pub') }:${path.join(containerMagentoDir, 'pub')}`,
                    `${ path.join(magentoDir, 'setup') }:${path.join(containerMagentoDir, 'setup')}`
                ] : [
                    `${ volumes.nginx.name }:/etc/nginx/conf.d`,
                    `${ volumes.appPub.name }:${path.join(containerMagentoDir, 'pub')}`,
                    `${ volumes.appSetup.name }:${path.join(containerMagentoDir, 'setup')}`
                ],
                restart: 'on-failure:5',
                // TODO: use connect instead
                network: isNotNativeLinux ? network.name : 'host',
                image: `${ nginx.version ? `nginx:${ nginx.version }` : nginx.image }`,
                name: `${ prefix }_nginx`,
                command: "nginx -g 'daemon off;'"
            },
            redis: {
                _: 'Redis',
                healthCheck: {
                    cmd: 'redis-cli ping'
                },
                ports: [`127.0.0.1:${ ports.redis }:6379`],
                forwardedPorts: [`127.0.0.1:${ ports.redis }:6379`],
                mounts: [`source=${ volumes.redis.name },target=/data`],
                // TODO: use connect instead
                network: network.name,
                image: `${ redis.version ? `redis:${ redis.version }` : redis.image }`,
                name: `${ prefix }_redis`,
                connectCommand: ['redis-cli']
            },
            mariadb: {
                _: 'MariaDB',
                healthCheck: {
                    cmd: 'mysqladmin ping --silent'
                },
                ports: [`127.0.0.1:${ ports.mariadb }:3306`],
                forwardedPorts: [`127.0.0.1:${ ports.mariadb }:3306`],
                mountVolumes: [
                    `${ volumes.mariadb.name }:/var/lib/mysql`,
                    `${ path.join(baseConfig.cacheDir, 'mariadb.cnf') }:/etc/mysql/my.cnf`
                ],
                env: {
                    MARIADB_PORT: 3306,
                    MARIADB_ROOT_PASSWORD: 'scandipwa',
                    MARIADB_USER: 'magento',
                    MARIADB_PASSWORD: 'magento',
                    MARIADB_DATABASE: 'magento'
                },
                command: [
                    '--log_bin_trust_function_creators=1'
                ]
                    .join(' '),
                securityOptions: [
                    'seccomp=unconfined'
                ],
                network: network.name,
                image: `${ mariadb.version ? `mariadb:${ mariadb.version }` : mariadb.image }`,
                name: `${ prefix }_mariadb`
            },
            elasticsearch: {
                _: 'ElasticSearch',
                healthCheck: {
                    cmd: 'curl --silent --fail localhost:9200/_cluster/health || exit 1'
                },
                ports: [`127.0.0.1:${ ports.elasticsearch }:9200`],
                forwardedPorts: [`127.0.0.1:${ ports.elasticsearch }:9200`],
                mounts: [`source=${ volumes.elasticsearch.name },target=/usr/share/elasticsearch/data`],
                env: {
                    'bootstrap.memory_lock': true,
                    'xpack.security.enabled': false,
                    'discovery.type': 'single-node',
                    ES_JAVA_OPTS: '-Xms512m -Xmx512m',
                    // https://www.elastic.co/guide/en/elasticsearch/reference/master/ml-settings.html
                    'xpack.ml.enabled': ['sse4.2', 'sse4_2'].some((sse42Flag) => cpuSupportedFlags.includes(sse42Flag))
                },
                network: network.name,
                image: `${ elasticsearch.version ? `elasticsearch:${ elasticsearch.version }` : elasticsearch.image }`,
                name: `${ prefix }_elasticsearch`
            }
        };

        if (ssl.enabled) {
            dockerConfig.nginx.ports.push(
                `${isIpAddress(host) ? host : '127.0.0.1'}:443:443`
            );
        }

        if (!ctx.debug && varnish.enabled) {
            dockerConfig.varnish = {
                _: 'Varnish',
                image: `${ varnish.version ? `varnish:${ varnish.version }` : varnish.image }`,
                name: `${ prefix }_varnish`,
                mountVolumes: [
                    `${ isLinux ? path.join(cacheDir, 'varnish') : volumes.varnish.name }:/etc/varnish`
                ],
                ports: isNotNativeLinux ? [
                    `${ isIpAddress(host) ? host : '127.0.0.1' }:${ ports.varnish }:80`
                ] : [],
                forwardedPorts: [
                    isNotNativeLinux
                        ? `127.0.0.1:${ ports.varnish }:80`
                        : `127.0.0.1:${ ports.varnish }`
                ],
                env: {
                    VARNISH_SIZE: '2G'
                },
                restart: 'on-failure:30',
                network: isNotNativeLinux ? network.name : 'host',
                // eslint-disable-next-line max-len
                command: `/bin/bash -c "varnishd -a :${ isNotNativeLinux ? 80 : ports.varnish } -t 600 -f /etc/varnish/default.vcl -s malloc,512m -p http_resp_hdr_len=70000 -p http_resp_size=100000 && varnishlog"`,
                tmpfs: [
                    '/var/lib/varnish:exec'
                ]
            };
        }

        return dockerConfig;
    };

    return {
        network,
        volumes,
        getContainers
    };
};
