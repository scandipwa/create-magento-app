export * from './deepmerge';

// export interface ServiceConfiguration {
//     config: Record<string, unknown>
// }

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
     * Set to 'default' if you want to use default config file
     * For custom configuration file use relative path:
     * @example ./my-config.conf
     */
    configTemplate: string
}

export interface PHPExtensions {
    gd: Record<string, unknown>
    intl: Record<string, unknown>
    zlib: Record<string, unknown>
    openssl: Record<string, unknown>
    sockets: Record<string, unknown>
    simpleXML: Record<string, unknown>
    xdebug: Record<string, unknown> & {
        version: string
    }
}

export interface PHPConfiguration {
    /**
     * PHP version
     */
    version: string

    /**
     * Configuration file template location
     *
     * Set to 'default' if you want to use default config file
     * For custom configuration file use relative path:
     * @example ./my-config.conf
     */
    configTemplate: string

    /**
     * Extensions for PHP
     */
    extensions: Record<string, unknown> & PHPExtensions
}

// export interface PHPFPMConfiguration {

//     /**
//      * Configuration file location
//      *
//      * Set to 'default' if you want to use default config file
//      * For custom configuration file use relative path:
//      * @example ./my-config.conf
//      */
//     configFile: 'default'
// }

// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface MySQLConfiguration extends Omit<DockerServiceConfiguration, 'config'> {}

// // eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface RedisConfiguration extends Omit<DockerServiceConfiguration, 'config'> {}

// export interface ElasticsearchConfiguration extends Omit<DockerServiceConfiguration, 'config'> {
//     config: {
//         env: {
//             /**
//              * Controls machine learning setting on Elasticsearch instance
//              *
//              * [ES documentation](https://www.elastic.co/guide/en/elasticsearch/reference/master/ml-settings.html#ml-settings)
//              */
//             'xpack.ml.enabled': boolean
//         }
//     }
// }

// export interface ComposerConfiguration {
//     version: 'default' | '1.x' | '2.x'
// }

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
}
