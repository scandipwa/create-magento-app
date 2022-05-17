import mysql2 from 'mysql2';

import { CMAConfiguration, PHPExtensions } from './index';

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
        varnish: number
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
            extensions: PHPExtensions
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
            getContainers(): Record<'nginx' | 'redis' | 'mysql' | 'elasticsearch' | 'varnish', {
                _: string
                ports: string[]
                healthCheck: {
                    cmd: string
                }
                env: Record<string, string>
                mountVolumes: string[]
                mounts: string[]
                restart: string
                securityOptions: string[]
                network: string
                image: string
                imageDetails: {
                    name: string
                    tag: string
                }
                name: string
                command: string
                connectCommand: string[]
            }>
        }
        baseConfig: {
            prefix: string
            magentoDir: string
            templateDir: string
            cacheDir: string
        }
        overridenConfiguration: Omit<CMAConfiguration, 'prefix' | 'useNonOverlappingPorts'>
        userConfiguration: Omit<CMAConfiguration, 'prefix' | 'useNonOverlappingPorts'>
        nonOverridenConfiguration: Omit<CMAConfiguration, 'prefix' | 'useNonOverlappingPorts'>
    }
    systemConfiguration: {
        analytics: boolean
        useNonOverlappingPorts: boolean
    }
    mysqlConnection: mysql2.Connection
    isSetupUpgradeNeeded?: boolean
}
