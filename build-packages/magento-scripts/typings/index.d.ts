import { ListrContext } from './context';

/* eslint-disable no-use-before-define */
export interface ServiceWithVersion {
    /**
     * Service version
     */
    version: string
}

export interface SSLTerminatorConfiguration extends ServiceWithVersion {
    /**
     * Configuration file location
     *
     * @example ./my-ssl-terminator-config.conf
     */
    configTemplate: string
}

export interface NginxConfiguration extends ServiceWithVersion {
    /**
     * Configuration file location
     *
     * @example ./my-nginx-config.conf
     */
    configTemplate: string
}

export interface VarnishConfiguration extends ServiceWithVersion {
    /**
     * Enable or disable Varnish in the project
     */
    enabled: boolean

    /**
     * Configuration file location
     *
     * @example ./my-varnish-config.vcl
     */
    configTemplate: string
}

export interface PHPExtensionInstallationInstruction {
    /**
     * Alternative name for extension
     *
     * @example ```js
     * alternativeName: ['Zend OPcache']
     * ```
     */
    alternativeName?: string[]
    /**
     * Command to install extension
     *
     * @example ```bash
     * docker-php-ext-install bcmath
     * ```
     * @example ```bash
     * pecl install xdebug && docker-php-ext-enable xdebug
     * ```
     */
    command: (arg0: (Omit<PHPExtensionInstallationInstruction, 'command'> & { ctx: ListrContext})) => string | string

    /**
     * System dependencies required by the extension
     *
     * @example ```js
     * dependencies: ['icu-dev']
     * ```
     */
    dependencies?: string[]

    /**
     * Extension version (if supported)
     */
    version?: string
}

export interface PHPExtensions {
    [key: string]: PHPExtensionInstallationInstruction
}

export interface PHPConfiguration {
    /**
     * Base image with tag
     */
    baseImage?: string

    /**
     * Image with XDebug enabled
     */
    debugImage?: string

    /**
     * Configuration file template location
     *
     * @example ./my-php-template.ini
     */
    configTemplate: string

    /**
     * PHP-FPM configuration file template location
     *
     * @example ./my-php-fpm-template.conf
     */
    fpmConfigTemplate: string

    /**
     * Extensions for PHP
     */
    extensions: PHPExtensions

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

        /**
         * Varnish configuration
         */
        varnish: VarnishConfiguration

        /**
         * SSL Terminator configuration
         */
        sslTerminator: SSLTerminatorConfiguration
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
