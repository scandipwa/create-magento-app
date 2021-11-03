import { ListrTaskWrapper } from 'listr2';

import { ListrContext } from './context';

/* eslint-disable no-use-before-define */
export interface ServiceWithVersion {
    /**
     * Service version
     */
    version: string
}

// export inter/

export interface NginxConfiguration extends ServiceWithVersion {
    /**
     * Configuration file location
     *
     * @example ./my-nginx-config.conf
     */
    configTemplate: string
}

export interface PHPExtension extends Record<string, unknown> {
    version?: string
    /**
     * Name of the extension loaded to PHP.
     *
     * @example `libsodium` extension is using `sodium` extensionName because it is loaded into PHP as `sodium` extension
     * and dynamic library that it requires called `sodium`
     *
     * ```
     * {
     *  php: {
     *      extensions: {
     *          libsodium: {
     *              extensionName: 'sodium'
     *          }
     *      }
     *  }
     * }
     * ```
     */
    linuxOptions?: string
    macosOptions?: string
    extensionName?: string
    hooks?: {
        preEnable?: (config: CMAConfiguration['configuration']) => Promise<void> | void
        postEnable?: (config: CMAConfiguration['configuration']) => Promise<void> | void
        preDisable?: (config: CMAConfiguration['configuration']) => Promise<void> | void
        postDisable?: (config: CMAConfiguration['configuration']) => Promise<void> | void
        preInstall?: (config: CMAConfiguration['configuration']) => Promise<void> | void
        postInstall?: (config: CMAConfiguration['configuration']) => Promise<void> | void
    }
    /**
     * Allow to define custom logic to install extension
     */
    install?: (
        ctx: ListrContext,
        task: ListrTaskWrapper<ListrContext, any>
    ) => Promise<void> | void

    /**
     * Allow to define custom logic to enable an extension
     */
    enable?: (
        ctx: ListrContext,
        task: ListrTaskWrapper<ListrContext, any>
    ) => Promise<void> | void

    /**
     * Allow to define custom logic to disable an extension
     */
    disable?: (
        ctx: ListrContext,
        task: ListrTaskWrapper<ListrContext, any>
    ) => Promise<void> | void
}

export interface PHPExtensions {
    gd: PHPExtension
    intl: PHPExtension
    zlib: PHPExtension
    openssl: PHPExtension
    sockets: PHPExtension
    simpleXML: PHPExtension
    xdebug: PHPExtension
    fileinfo: PHPExtension
    libsodium: PHPExtension
    [key: string]: PHPExtension
}

export interface PHPConfiguration {
    /**
     * PHP version
     */
    version: string

    /**
     * Configuration file template location
     *
     * @example ./my-php-template.ini
     */
    configTemplate: string

    /**
     * Extensions for PHP
     */
    extensions: PHPExtensions & Record<string, PHPExtension>

    /**
     * Disabled extension list
     */
    disabledExtensions?: string[]
}
export interface SSLConfiguration {
    /**
     * Enables or disables SSL in application
     */
    enabled: boolean

    /**
     * SSL certificate name
     *
     * @example
     * `./ssl_certificate.pem`
     */
    ssl_certificate: string

    /**
     * SSL certificate key name
     *
     * @example
     * `./ssl_certificate-key.pem`
     */
    ssl_certificate_key: string
}

export interface CMAConfiguration {
    /**
     * Services configuration
     */
    configuration: {
        /**
         * PHP configuration
         */
        php: PHPConfiguration

        /**
         * Nginx configuration
         */
        nginx: NginxConfiguration

        /**
         * MySQL configuration
         */
        mysql: ServiceWithVersion

        /**
         * MariaDB configuration
         */
        mariadb: ServiceWithVersion

        /**
         * ElasticSearch configuration
         */
        elasticsearch: ServiceWithVersion

        /**
         * Redis configuration
         */
        redis: ServiceWithVersion

        /**
         * Composer configuration
         */
        composer: ServiceWithVersion
    }
    /**
     * Magento configuration
     */
    magento: {
        first_name: string
        last_name: string
        email: string
        user: string
        password: string
        /**
         * Magento admin panel url.
         *
         * @default '/admin'
         */
        adminuri: string

        /**
         * One of found magento modes:`'default' | 'developer' | 'production' | 'maintenance'`
         *
         * @default 'developer'
         */
        mode: 'default' | 'developer' | 'production' | 'maintenance'

        /**
         * Magento Edition configuration
         *
         * This field will be only used during Magento installation.
         *
         * @default 'community'
         */
        edition: 'community' | 'enterprise'
    }
    /**
     *  Custom host for website base url
     * @default 'localhost'
     * */
    host: string

    /**
     * SSL Configuration
     */
    ssl: SSLConfiguration

    /**
     * Prefix config.
     * @default true
     *
     * Set to `true` if you want to use prefix for the project, `false` if don't.
     *
     * @description If prefix is set to `true` a unique identifier will be appended to docker container and volume names to prevent possible
     * interference between folders with similar names.
     * If prefix is set to `false` docker container and volume names will only include folder name **which is not safe and not recommended**.
     */
    prefix: boolean

    /**
     * Non-overlapping ports config
     * @default false
     *
     * @deprecated Use global configuration file.
     * @description If set to `true` CMA will try retrieving others CMA projects port configuration
     * and will not use their ports for itself.
     */
    useNonOverlappingPorts: boolean
}
