import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command'

export interface VolumeLsOptions<T extends boolean = false> {
    filter?: string | string[]
    format?: string
    formatToJSON?: T
    quiet?: boolean
}

export interface VolumeLsResult {
    Driver: string
    Labels: string
    Links: string
    MountPoint: string
    Name: string
    Scope: string
    Size: string
}

export function ls(
    options?: VolumeLsOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function ls(
    options?: VolumeLsOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<VolumeLsResult[]>

export interface VolumeCreateOptions {
    driver?: string
    label?: string
    name: string
    opt?: Record<string, string>
}

export function create(
    options?: VolumeCreateOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>

export interface VolumeRmOptions {
    force?: boolean
    volumes: string[]
}

export function rm(
    options?: VolumeRmOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>

export interface VolumeInspectOptions<T extends boolean = false> {
    volume: string
    format?: string
    formatToJSON?: T
}

export interface VolumeInspectResult {
    CreatedAt: string
    Driver: string
    Labels: unknown
    Mountpoint: string
    Name: string
    Options: unknown
    Scope: string
    CreatedTime: number
    Containers: Record<
        string,
        {
            Name: string
            Destination: string
        }
    >
}

export function inspect(
    options?: VolumeInspectOptions,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<string>
export function inspect(
    options?: VolumeInspectOptions<true>,
    execOptions?: ExecAsyncSpawnOptions<false>
): Promise<VolumeInspectResult>
