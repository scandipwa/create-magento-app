import * as mysql2 from 'mysql2'

import { ProjectConfig } from '../lib/config/config'
import { DockerVersionResult } from '../lib/tasks/docker/api'
import { systemApi } from '../lib/tasks/docker/system'
import { CMAConfiguration, PHPExtensions } from './index'
import { PHPStormConfig } from './phpstorm'

export interface ListrContext {
    noOpen?: boolean
    skipSetup?: boolean
    resetGlobalConfig?: boolean
    withCustomersData?: boolean
    force?: boolean
    magentoFirstInstall?: boolean
    encryptionKey?: string
    pullImages?: boolean
    throwMagentoVersionMissing: boolean
    projectPath: string
    systemDFData?: systemApi.SystemDFResult
    verbose: boolean
    magentoVersion: string
    composerVersion: string
    phpVersion: string
    elasticSearchVersion: string
    openSearchVersion: string
    cgroupVersion: 'v1' | 'v2'
    port?: number
    ports: {
        app: number
        fpm: number
        fpmXdebug: number
        xdebug: number
        mariadb: number
        redis: number
        elasticsearch: number
        opensearch: number
        varnish: number
        sslTerminator: number
        maildevSMTP: number
        maildevWeb: number
    }
    cachedPorts?: {
        app: number
        fpm: number
        fpmXdebug: number
        xdebug: number
        mariadb: number
        redis: number
        elasticsearch: number
        varnish: number
        sslTerminator: number
        maildevSMTP: number
        maildevWeb: number
    }
    arch: 'arm64' | 'x64'
    isArm: boolean
    isWsl: boolean
    isArmMac: boolean
    platform: NodeJS.Platform
    platformVersion: string
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
            fpmTemplatePath: string
            debugIniPath: string
            debugTemplatePath: string
            debugFpmConfPath: string
            debugFpmTemplatePath: string
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
            volumes: Record<string,
                {
                    name: string,
                    driver?: string,
                    opt?: {
                        mode?: string,
                        device?: string,
                        o?: string,
                        type?: string
                    }
                }
            >
            getContainers(ports?: ListrContext['ports']): Record<'php' | 'phpWithXdebug' | 'sslTerminator' | 'nginx' | 'redis' | 'mariadb' | 'elasticsearch' | 'maildev' | 'varnish',
                {
                    _: string
                    ports: string[]
                    healthCheck: {
                        cmd: string
                    }
                    env: Record<string, string>
                    mountVolumes: string[]
                    pullImage?: boolean
                    mounts: string[]
                    restart: string
                    securityOptions: string[]
                    network: string
                    image: string
                    remoteImages?: string[]
                    name: string
                    command: string
                    connectCommand: string[]
                    dependsOn?: string[]
                    serviceReadyLog?: string
                    platform?: string
                }
            >
        }
        baseConfig: {
            prefix: string
            magentoDir: string
            templateDir: string
            cacheDir: string
            containerMagentoDir: string
        }
        overridenConfiguration: Required<Omit<
            CMAConfiguration,
            'useNonOverlappingPorts'
        > & { magentoVersion: string }>
        userConfiguration:  Omit<
            CMAConfiguration,
            'useNonOverlappingPorts'
        >
        nonOverridenConfiguration:  Required<Omit<
            CMAConfiguration,
            'useNonOverlappingPorts'
        >>
        phpStorm: PHPStormConfig
        projectConfig: ProjectConfig
        magentoConfiguration: CMAConfiguration['magento']
    }
    systemConfiguration: {
        analytics: boolean
        useNonOverlappingPorts: boolean
    }
    databaseConnection: mysql2.Connection
    isSetupUpgradeNeeded?: boolean
    isDockerDesktop?: boolean
    dockerServerData?: DockerVersionResult['Server']
    dockerClientData?: DockerVersionResult['Client']
    dockerVersion?: DockerVersionResult['Server']['Version']
    dockerMemoryLimit: number
}
