import { ExecAsyncSpawnOptions } from '../../../util/exec-async-command';

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
