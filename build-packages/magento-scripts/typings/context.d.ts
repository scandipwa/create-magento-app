import mysql2 from 'mysql2';

import { CMAConfiguration, PHPExtensions } from './index';
import { PHPStormConfig } from './phpstorm';

export interface ListrContext {
    magentoVersion: string
    composerVersion: string
    port?: number
    ports?: {
        app: number
        fpm: number
        xdebug: number
        mysql: number
        redis: number
        elasticsearch: number
        varnish: number
        sslTerminator: number
    }
    arch: 'arm64' | 'x64'
    isArm: boolean
    isWsl: boolean
    isArmMac: boolean
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
            iniTemplatePath: string
            fpmConfPath: string
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
            getContainers(): Record<'php' | 'sslTerminator' | 'nginx' | 'redis' | 'mysql' | 'elasticsearch' | 'varnish', {
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
                debugImage?: string
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
            containerMagentoDir: string
        }
        overridenConfiguration: Omit<CMAConfiguration, 'prefix' | 'useNonOverlappingPorts'>
        userConfiguration: Omit<CMAConfiguration, 'prefix' | 'useNonOverlappingPorts'>
        nonOverridenConfiguration: Omit<CMAConfiguration, 'prefix' | 'useNonOverlappingPorts'>
        phpStorm: PHPStormConfig
    }
    systemConfiguration: {
        analytics: boolean
        useNonOverlappingPorts: boolean
    }
    mysqlConnection: mysql2.Connection
    isSetupUpgradeNeeded?: boolean
}
