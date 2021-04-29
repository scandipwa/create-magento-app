import { CMAConfiguration } from './index';

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
    arch: 'arm64' | 'x64'
    isArm: boolean
    platform?: NodeJS.Platform
    platformVersion?: string
    /**
     * Magento Edition
     *
     * @default 'community'
     */
    edition?: 'community' | 'enterprise'
    config: {
        php: {
            binPath: string
            iniPath: string
            iniTemplatePath: string
            fpmBinPath: string
            fpmConfPath: string
            fpmPidFilePath: string
            extensions: CMAConfiguration['configuration']['php']['extensions']
            version: string
        }
        composer: {
            dirPath: string
            binPath: string
            version: string
        }
        docker: {
            network: {
                name: string
            }
            volumes: Record<'mysql' | 'redis' | 'elasticsearch' | 'nginx' | 'appPub' | 'appSetup', {
                name: string
                opts?: {
                    type: string
                    device: string
                    o: string
                }
            }>
        }
    }
}
