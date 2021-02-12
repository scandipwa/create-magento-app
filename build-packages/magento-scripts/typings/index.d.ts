export interface ServiceWithVersion {
    /**
     * Container version
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

export interface PHPExtension {
    version: string
    [key: string]: unknown
}

export interface PHPExtensions {
    gd: PHPExtension
    intl: PHPExtension
    zlib: PHPExtension
    openssl: PHPExtension
    sockets: PHPExtension
    simpleXML: PHPExtension
    xdebug: PHPExtension
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
    extensions: Record<string, unknown> & PHPExtensions
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
         * ElasticSearch configuration
         */
        elasticsearch: ServiceWithVersion

        /**
         * Redis configuration
         */
        redis: ServiceWithVersion
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
        adminuri: string
        mode: string
    }
    /**
     *  Custom host for website base url
     * */
    host: string

    /**
     * SSL Configuration
     */
    ssl: SSLConfiguration
}
