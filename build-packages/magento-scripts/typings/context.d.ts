export interface ListrContext {
    magentoVersion: string
    port?: number
    ports?: {
        app: number
        fpm: number
        xdebug: number
        mysql: number
        redis: number
        elasticsearch: number
    }
    platform?: NodeJS.Platform
    platformVersion?: string
}
