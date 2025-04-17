import { ListrContext } from './context'
import './override'

/* eslint-disable no-use-before-define */
export interface ServiceWithImage {
    /**
     * Service version
     *
     * @deprecated
     */
    version?: string

    /**
     * Service Docker image
     */
    image: string
}

export interface ServiceWithoutImage {
    /**
     * Service Docker image
     */
    image: string
}

export interface MariaDBConfiguration extends ServiceWithImage {
    /**
     * Use MariaDB [optimizer-switch](https://mariadb.com/kb/en/optimizer-switch/) configuration.
     *
     * Allows to be boolean or custom value that will be set in the template
     */
    useOptimizerSwitch?: boolean | string

    /**
     * `mariadb` file name to be used in the shell
     */
    binFileName?: string

    /**
     * `mariadb-admin` file name to be used in the shell, for heathcheck
     */
    binAdminFileName?: string
}

export interface SSLTerminatorConfiguration extends ServiceWithImage {
    /**
     * Configuration file location
     *
     * @example ./my-ssl-terminator-config.conf
     */
    configTemplate: string
}

export interface NginxConfiguration extends ServiceWithImage {
    /**
     * Configuration file location
     *
     * @example ./my-nginx-config.conf
     */
    configTemplate: string
}

export interface ElasticSearchConfiguration extends ServiceWithImage {
    /**
     * Environmental variables used for Elasticsearch container
     */
    env: Record<string, unknown>
}

export interface OpenSearchSearchConfiguration extends ServiceWithoutImage {
    /**
     * Environmental variables used for OpenSearch container
     */
    env: Record<string, unknown>
}

export type SearchEngineConfiguration = 'elasticsearch' | 'opensearch'

export interface VarnishConfiguration extends ServiceWithImage {
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

    /**
     * Enable or disable healthcheck in the project
     */
    healthCheck: boolean
}

export interface ComposerConfiguration {
    /**
     * Composer version
     *
     * This will become part of the url (`https://getcomposer.org/download/<version>/composer.phar`) so you can use the following variants as well:
     * ```
     * 'latest-stable'
     * 'latest-preview'
     * 'latest-1.x'
     * 'latest-2.x'
     * 'latest-2.2.x'
     *
     * '2.4.1'
     * '2.3.10'
     * '2.2.18'
     * '2.1.14'
     * ```
     *
     * @url https://getcomposer.org/download/
     */
    version: 'latest-stable'
    | 'latest-preview'
    | 'latest-1.x'
    | 'latest-2.x'
    | 'latest-2.2.x'
    | `${number}.${number}.${number}`

    /**
     *  Composer global plugins that will be added to Docker image
     */
    plugins?: Record<
        string,
        {
            version?: string
            options?: string
            /**
             * Enable composer plugin
             */
            enabled?: boolean
        }
    >
}

export interface PHPExtensionInstallationInstruction {
    /**
     * Main extension name that will be used for `docker-php-ext-install` command
     */
    name?: string
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
    command:
        | string
        | ((
              arg0: Omit<PHPExtensionInstallationInstruction, 'command'> & {
                  ctx: ListrContext
              }
          ) => string)
        | ((
              arg0: Omit<PHPExtensionInstallationInstruction, 'command'> & {
                  ctx: ListrContext
              }
          ) => Promise<string>)

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
    baseImage: string

    /**
     * Configuration file template location
     *
     * @example ./my-php-template.ini
     */
    configTemplate: string
    /**
     * PHP XDebug file template location
     *
     * @example ./my-php-debug-template.ini
     */
    debugTemplate: string

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
     * Environmental variables used for PHP container
     */
    env: Record<string, unknown>
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
    ssl_certificate?: string

    /**
     * SSL certificate key name
     *
     * @example
     * `./ssl_certificate-key.pem`
     */
    ssl_certificate_key?: string

    /**
     * SSL external provider configuration
     *
     * Set to `true` if you don't need locally provided SSL certificates
     *
     * @default false
     */
    external_provider?: boolean
}

export interface NewRelicConfiguration {
    /**
     * Enables or disables New Relic in application
     */
    enabled: boolean

    /**
     * New Relic Agent version
     */
    agentVersion?: string

    /**
     * New Relic license key
     */
    licenseKey?: string
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
         * MariaDB configuration
         */
        mariadb: MariaDBConfiguration

        /**
         * ElasticSearch configuration
         */
        elasticsearch: ElasticSearchConfiguration

        /**
         * OpenSearch configuration
         */
        opensearch: OpenSearchSearchConfiguration

        /**
         * Search engine configuration
         */
        searchengine?: SearchEngineConfiguration

        /**
         * Redis configuration
         */
        redis: ServiceWithImage

        /**
         * Composer configuration
         */
        composer: ComposerConfiguration

        /**
         * Varnish configuration
         */
        varnish: VarnishConfiguration

        /**
         * SSL Terminator configuration
         */
        sslTerminator: SSLTerminatorConfiguration

        /**
         * New Relic configuration
         */
        newRelic?: NewRelicConfiguration

        /**
         * MailDev configuration
         */
        maildev: ServiceWithImage

        /**
         * @deprecated MySQL configuration
         */
        mysql: ServiceWithImage
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
     *  @default 'localhost'
     *
     * @deprecated Use `storeDomains` instead, as follows: `storeDomains: { admin: 'localhost' }`
     */
    host: string

    /**
     * Custom domains for magento stores by store code
     *
     * Note: you can look up **scope_id** in `app/etc/config.php` in `scopes` section.
     *
     * @default { admin: 'localhost' }
     *
     * @example ```js
     *  storeDomains: {
     *   admin: 'localhost',
     *   custom_store_code: 'scandipwa.local',
     *   another_store_code: 'another-store.local'
     * }
     * ```
     */
    storeDomains: { admin: string } & Record<string, string>

    /**
     * SSL Configuration
     */
    ssl?: SSLConfiguration

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
    prefix?: boolean
}
