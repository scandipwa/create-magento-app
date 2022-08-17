/* eslint-disable max-len */
import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command';

export interface ContainerLsOptions<T extends boolean = false> {
    all?: boolean
    filter?: string | string[]
    format?: string
    quiet?: boolean
    noTrunc?: boolean
    formatToJSON?: T
    latest?: boolean
}

export interface ContainerLsResult {
    Command: string
    CreatedAt: string
    ID: string
    Image: string
    Labels: string
    LocalVolumes: string
    Mounts: string
    Names: string
    Networks: string
    Ports: string
    RunningFor: string
    Size: string
    State: string
    Status: string
}

export function ls(options?: ContainerLsOptions, execOptions?: ExecAsyncSpawnOptions<false>): Promise<string>
export function ls(options?: ContainerLsOptions<true>, execOptions?: ExecAsyncSpawnOptions<false>): Promise<ContainerLsResult[]>

export interface ContainerExecOptions {
    /**
     * Set environment variables [docs](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
     */
    env?: Record<string, string>

    /**
     * Working directory inside the container
     */
    workdir?: string

    /**
     * Username or UID (format: <name|uid>[:<group|gid>])
     */
    user?: string

    /**
     * Allocate a pseudo-TTY
     */
    tty?: boolean
}

export function exec(command: string, container: string, options?: ContainerExecOptions, execOptions?: ExecAsyncSpawnOptions<false>): Promise<string>

export interface ContainerRunOptions {
    /**
     * Add a custom host-to-IP mapping (host:ip)
     */
    addHost?: string
    /**
     * Automatically remove the container when it exits
     */
    rm?: boolean

    /**
     * Run container in background and print container ID
     */
    detach?: boolean

    tty?: boolean
    /**
     * Publish or expose port [docs](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose)
     */
    ports?: number[]

    /**
     * Add bind mounts or volumes using the --mount flag [docs](https://docs.docker.com/engine/reference/commandline/run/#add-bind-mounts-or-volumes-using-the---mount-flag)
     */
    mounts?: string[]

    /**
     * Mount volume [docs](https://docs.docker.com/engine/reference/commandline/run/#mount-volume--v---read-only)
     */
    mountVolumes?: string[]

    /**
     * Set environment variables [docs](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
     */
    env?: Record<string, string>
    image?: string
    /**
     * Restart policies [docs](https://docs.docker.com/engine/reference/commandline/run/#restart-policies---restart)
     */
    restart?: string

    /**
     * Container name
     */
    name?: string

    /**
     * Container entrypoint
     */
    entrypoint?: string

    /**
     * Container command
     */
    command?: string

    /**
     * Container heathcheck properties
     */
    healthCheck?: Record<'cmd' | 'interval' | 'retries' | 'start-period' | 'timeout', string>

    /**
     * Security options [docs](https://docs.docker.com/engine/reference/commandline/run/#optional-security-options---security-opt)
     */
    securityOptions?: string[]
    tmpfs?: string[]
    /**
     * Username or UID (format: <name|uid>[:<group|gid>])
     */
    user?: string
}

export function run(containerOptions: ContainerRunOptions, execOptions?: ExecAsyncSpawnOptions<false>): Promise<false>

export function runCommand(options: ContainerRunOptions): string[]
