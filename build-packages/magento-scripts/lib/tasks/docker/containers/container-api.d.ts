/* eslint-disable max-len */
import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command'

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

export function ls(
    options?: ContainerLsOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function ls(
    options?: ContainerLsOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<ContainerLsResult[]>

export interface ContainerExecOptions {
    command: string

    /**
     * container id or name
     */
    container: string
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

    /**
     * Keep STDIN open even if not attached
     */
    interactive?: boolean
}

export function exec<T>(
    options: ContainerExecOptions,
    execOptions?: ExecAsyncSpawnOptions<T>
): Promise<string>

export function execCommand(options: ContainerExecOptions): string[]

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
    ports?: string[]

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
    env?: Record<string, unknown>
    image: string
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
    healthCheck?: Partial<
        Record<
            'cmd' | 'interval' | 'retries' | 'start-period' | 'timeout',
            string
        >
    >

    /**
     * Security options [docs](https://docs.docker.com/engine/reference/commandline/run/#optional-security-options---security-opt)
     */
    securityOptions?: string[]
    tmpfs?: string[]
    /**
     * Username or UID (format: <name|uid>[:<group|gid>])
     */
    user?: string

    network?: string

    expose?: (string | number)[]

    /**
     * Memory option [docs](https://docs.docker.com/engine/reference/commandline/run/#memory)
     */
    memory?: string

    /**
     * Platform option [docs](https://docs.docker.com/engine/reference/commandline/run/#platform)
     */
    platform?: string
}

export function run<T>(
    containerOptions: ContainerRunOptions,
    execOptions?: ExecAsyncSpawnOptions<T>
): Promise<string>

export function runCommand(options: ContainerRunOptions): string[]

export interface ContainerLogsOptions<T = never> {
    name: string
    details?: boolean
    follow?: boolean
    since?: string
    tail?: string
    timestamps?: boolean
    until?: string
    parser?: (line: string) => T
}

export function logs(
    options: ContainerLogsOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function logs<T>(
    options: ContainerLogsOptions<T>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<T[]>

export function stop(
    containers: string[],
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function rm(
    containers: string[],
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
